import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '..//database';
import { AppError } from '..//errorHandler';
import { AuthRequest } from '..//auth';
import { emitNotification } from '..//socket';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: images, documents, archives'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

// @desc    Upload a single file
// @route   POST /api/upload/single
// @access  Private
export const uploadSingle = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const fileData = {
    id: req.file.filename,
    originalName: req.file.originalname,
    filename: req.file.filename,
    url: fileUrl,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedAt: new Date(),
    uploadedBy: req.user!.id,
  };

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'file_uploaded', {
    message: 'File uploaded successfully',
    file: fileData,
  });

  res.status(201).json({
    message: 'File uploaded successfully',
    file: fileData,
  });
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultiple = async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const uploadedFiles = files.map((file) => ({
    id: file.filename,
    originalName: file.originalname,
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date(),
    uploadedBy: req.user!.id,
  }));

  res.status(201).json({
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    files: uploadedFiles,
  });
};

// @desc    Upload file and attach to client
// @route   POST /api/upload/clients/:clientId
// @access  Private
export const uploadClientFile = async (req: AuthRequest, res: Response) => {
  const { clientId } = req.params;

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Verify client exists
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  // Create client attachment record
  const attachment = await prisma.clientAttachment.create({
    data: {
      clientId,
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'client_file_uploaded', {
    message: 'File attached to client',
    attachment,
  });

  res.status(201).json({
    message: 'File uploaded and attached to client successfully',
    attachment,
  });
};

// @desc    Upload project photo
// @route   POST /api/upload/projects/:projectId/photos
// @access  Private
export const uploadProjectPhoto = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const photoUrl = `/uploads/${req.file.filename}`;

  // Create project photo record
  const photo = await prisma.projectPhoto.create({
    data: {
      projectId,
      url: photoUrl,
      caption: req.body.caption || '',
    },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'project_photo_uploaded', {
    message: 'Photo added to project',
    photo,
  });

  res.status(201).json({
    message: 'Photo uploaded and attached to project successfully',
    photo,
  });
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
export const deleteFile = async (req: AuthRequest, res: Response) => {
  const { filename } = req.params;

  const filePath = path.join(__dirname, '../../../uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new AppError('File not found', 404);
  }

  // Delete file from filesystem
  fs.unlinkSync(filePath);

  // Delete related database records
  await prisma.clientAttachment.deleteMany({
    where: { fileUrl: `/uploads/${filename}` },
  });

  await prisma.projectPhoto.deleteMany({
    where: { url: `/uploads/${filename}` },
  });

  res.status(200).json({
    message: 'File deleted successfully',
  });
};

// @desc    Get file info
// @route   GET /api/upload/:filename
// @access  Private
export const getFileInfo = async (req: AuthRequest, res: Response) => {
  const { filename } = req.params;

  const filePath = path.join(__dirname, '../../../uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new AppError('File not found', 404);
  }

  const stats = fs.statSync(filePath);

  // Find related records
  const [clientAttachment, projectPhoto] = await Promise.all([
    prisma.clientAttachment.findFirst({
      where: { fileUrl: `/uploads/${filename}` },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.projectPhoto.findFirst({
      where: { url: `/uploads/${filename}` },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  res.status(200).json({
    file: {
      filename,
      url: `/uploads/${filename}`,
      size: stats.size,
      uploadedAt: stats.birthtime,
      relatedTo: clientAttachment
        ? { type: 'client', data: clientAttachment }
        : projectPhoto
          ? { type: 'project', data: projectPhoto }
          : null,
    },
  });
};


