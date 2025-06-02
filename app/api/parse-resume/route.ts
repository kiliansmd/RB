import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { withErrorHandling, withRateLimit } from '@/lib/api-middleware';
import { fileUploadSchema, resumeSchema, createApiResponse } from '@/utils/validation';
import { revalidateTag } from 'next/cache';
import formidable, { File as FormidableFile } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Hilfsfunktion, um formidable mit Promise zu nutzen (Web Request Adapter)
async function parseFormFromWebRequest(req: Request, maxFileSizeMB = 20): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  // formidable v3+ kann mit Web Streams umgehen
  const form = formidable({
    maxFileSize: maxFileSizeMB * 1024 * 1024,
    multiples: false,
  });
  // @ts-ignore
  return await form.parse(req);
}

// Development mock function
const mockResumeParser = async (file: any) => {
  console.log('🔧 Development mode: Using mock resume parser for file:', file.originalFilename);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock parsed data
  return {
    name: "Max Mustermann",
    title: "Software Developer",
    brief: "Erfahrener Entwickler mit 5+ Jahren Erfahrung in TypeScript und React.",
    contact: {
      email: "max.mustermann@example.com",
      phone: "+49 123 456789",
      location_city: "Berlin",
      location_country: "Germany"
    },
    employment_history: [
      {
        company: "Tech Corp GmbH",
        position: "Senior Developer",
        startDate: "2020-01",
        endDate: "Present",
        description: ["Frontend development with React", "Backend APIs with Node.js"]
      }
    ],
    education: [
      {
        institution: "TU Berlin",
        degree: "Bachelor of Science",
        area: "Computer Science",
        startDate: "2015-10",
        endDate: "2019-09"
      }
    ],
    skills: ["TypeScript", "React", "Node.js", "Firebase", "Next.js"],
    languages: ["German", "English"],
    derived: {
      years_of_experience: 5,
      approximate_age: 28
    }
  };
};

export const POST = withRateLimit(10, 60000)(
  withErrorHandling(async (req: Request) => {
    let fields, files;
    try {
      ({ fields, files } = await parseFormFromWebRequest(req, 20));
    } catch (err: any) {
      if (err?.message?.includes('maxFileSize exceeded')) {
        return NextResponse.json({ error: 'Die Datei ist größer als 20 MB.' }, { status: 413 });
      }
      return NextResponse.json({ error: 'Fehler beim Datei-Upload: ' + err?.message }, { status: 400 });
    }

    const file = files.file as FormidableFile;
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen.' }, { status: 400 });
    }

    // Validiere die Datei (optional, je nach Schema)
    // await fileUploadSchema.parseAsync({ file });

    let parsedData;
    if (process.env.NODE_ENV === 'development' && 
        (!process.env.RESUME_PARSER_API_KEY || 
         process.env.RESUME_PARSER_API_KEY === 'dummy-api-key-for-development')) {
      parsedData = await mockResumeParser(file);
    } else {
      if (!process.env.RESUME_PARSER_API_KEY) {
        throw new Error('RESUME_PARSER_API_KEY is not defined in environment variables');
      }
      const uploadFormData = new FormData();
      // @ts-ignore
      uploadFormData.append('file', file.filepath ? require('fs').createReadStream(file.filepath) : file);
      const response = await fetch('https://resumeparser.app/resume/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESUME_PARSER_API_KEY}`
        },
        body: uploadFormData,
      });
      if (!response.ok) {
        throw new Error(`Resume parser API error: ${response.status}`);
      }
      parsedData = await response.json();
    }

    // Validiere die geparsten Daten
    let validatedData;
    try {
      validatedData = await resumeSchema.parseAsync(parsedData);
    } catch (validationError) {
      console.warn('Parsed data validation warning:', validationError);
      validatedData = parsedData;
    }

    // Speichere in Firebase (wie gehabt)
    if (process.env.NODE_ENV !== 'development' || 
        process.env.FIREBASE_PROJECT_ID !== 'cv-parser-dev') {
      const resumeData = {
        ...validatedData,
        fileName: file.originalFilename,
        fileSize: file.size,
        uploadedAt: Timestamp.now(),
        lastModified: Timestamp.now(),
        version: 1,
        status: 'active',
        metadata: {
          // userAgent und ip können aus req.headers extrahiert werden, falls benötigt
        }
      };
      const resumeRef = await db.collection('resumes').add(resumeData);
      revalidateTag('resume');
      return NextResponse.json(
        createApiResponse({
          id: resumeRef.id,
          message: 'Resume parsed and stored successfully',
          warnings: validatedData !== parsedData ? ['Some fields did not pass validation'] : []
        })
      );
    } else {
      // Development mode - return mock response without saving to Firebase
      return NextResponse.json(
        createApiResponse({
          id: 'dev-mock-id-' + Date.now(),
          message: 'Resume parsed successfully (development mode)',
          data: validatedData,
          warnings: ['Development mode: Data not saved to Firebase']
        })
      );
    }
  })
);