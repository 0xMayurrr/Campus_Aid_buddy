import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import Library from '../models/Library';
import { AuthRequest } from '../middleware/auth';

export const uploadLibraryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, department, year, subject, topic, description, videoUrl } = req.body;
    if (!title || !type || !department || !year || !subject) {
      return res.status(400).json({ success: false, error: 'title, type, department, year, subject are required' });
    }

    let fileUrl = videoUrl || '';

    // If a file was uploaded via multer, upload to Cloudinary
    if (req.file) {
      const resourceType = type === 'video' ? 'video' : 'raw';
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder: 'campus-aid-buddy/library' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file!.buffer);
      });
      fileUrl = result.secure_url;
    }

    if (!fileUrl) return res.status(400).json({ success: false, error: 'File or video URL required' });

    const item = await Library.create({
      title, type, fileUrl, department,
      year: Number(year), subject, topic, description,
      uploadedBy: req.user!.id,
      uploadedByName: req.user!.name,
    });
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getLibraryItems = async (req: Request, res: Response) => {
  try {
    const { dept, year, subject, type } = req.query;
    const filter: any = {};
    if (dept) filter.department = dept;
    if (year) filter.year = Number(year);
    if (subject) filter.subject = subject;
    if (type) filter.type = type;
    const items = await Library.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteLibraryItem = async (req: AuthRequest, res: Response) => {
  try {
    await Library.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
