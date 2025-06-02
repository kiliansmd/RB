// app/api/resume/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { withErrorHandling, withRateLimit } from '@/lib/api-middleware';
import { resumeSchema, createApiResponse } from '@/utils/validation';
import { unstable_cache } from 'next/cache';

// Development mock function
const getMockResumeById = (id: string) => {
  console.log(`🔧 Development mode: Using mock resume data for ID: ${id}`);
  
  const mockResumes: Record<string, any> = {
    'mock-resume-1': {
      id: 'mock-resume-1',
      name: 'Max Mustermann',
      title: 'Senior Software Developer',
      fileName: 'max_mustermann_cv.pdf',
      uploadedAt: {
        _seconds: Math.floor(Date.now() / 1000) - 86400,
        _nanoseconds: 0
      },
      contact: {
        location_city: 'Berlin',
        location_country: 'Germany',
        email: 'max.mustermann@example.com',
        phone: '+49 123 456789'
      },
      derived: {
        years_of_experience: 8,
        approximate_age: 32
      },
      skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'Docker'],
      employment_history: [
        {
          company: 'Tech Corp GmbH',
          position: 'Senior Software Developer',
          startDate: '2020-01',
          endDate: 'Present',
          description: ['Led development of microservices architecture', 'Mentored junior developers']
        }
      ],
      education: [
        {
          institution: 'TU Berlin',
          degree: 'Master of Science',
          area: 'Computer Science',
          startDate: '2015-10',
          endDate: '2018-09'
        }
      ],
      senioritaet: 'senior'
    },
    'mock-resume-2': {
      id: 'mock-resume-2',
      name: 'Sarah Schmidt',
      title: 'Frontend Developer',
      fileName: 'sarah_schmidt_cv.pdf',
      uploadedAt: {
        _seconds: Math.floor(Date.now() / 1000) - 172800,
        _nanoseconds: 0
      },
      contact: {
        location_city: 'München',
        location_country: 'Germany',
        email: 'sarah.schmidt@example.com'
      },
      derived: {
        years_of_experience: 4,
        approximate_age: 28
      },
      skills: ['JavaScript', 'Vue.js', 'CSS', 'Figma'],
      senioritaet: 'mid'
    },
    'mock-resume-3': {
      id: 'mock-resume-3',
      name: 'Tom Weber',
      title: 'Junior Full Stack Developer',
      fileName: 'tom_weber_cv.pdf',
      uploadedAt: {
        _seconds: Math.floor(Date.now() / 1000) - 259200,
        _nanoseconds: 0
      },
      contact: {
        location_city: 'Hamburg',
        location_country: 'Germany'
      },
      derived: {
        years_of_experience: 2,
        approximate_age: 25
      },
      skills: ['Python', 'Django', 'PostgreSQL', 'Git'],
      senioritaet: 'junior'
    }
  };
  
  return mockResumes[id] || null;
};

// Cache für Resume-Daten
const getCachedResume = unstable_cache(
  async (id: string) => {
    const docRef = db.collection('resumes').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  },
  ['resume'],
  { 
    revalidate: 3600, // 1 Stunde Cache
    tags: ['resume']
  }
);

export const GET = withRateLimit(100, 60000)(
  withErrorHandling(async (request: Request, context?: Record<string, unknown>) => {
    // Await params according to Next.js 15 requirements
    const params = await (context as any)?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        createApiResponse(null, false),
        { status: 400 }
      );
    }

    let resumeData;

    // Check if we should use mock data (only when no real Firebase credentials)
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      
      // Use mock data when no real Firebase credentials
      console.log(`🔧 Development mode: Using mock resume data for ID: ${id}`);
      resumeData = getMockResumeById(id);
      
    } else {
      // Use real Firebase data
      console.log(`🔥 Using real Firebase data for ID: ${id} from project:`, process.env.FIREBASE_PROJECT_ID);
      resumeData = await getCachedResume(id);
    }
    
    if (!resumeData) {
      return NextResponse.json(
        createApiResponse({ error: 'Resume not found' }, false),
        { status: 404 }
      );
    }

    // Validiere die Daten
    try {
      const validatedData = await resumeSchema.parseAsync(resumeData);
      
      return NextResponse.json(
        createApiResponse(validatedData),
        { 
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          }
        }
      );
    } catch (validationError) {
      console.warn('Resume data validation warning:', validationError);
      // Gebe Daten trotzdem zurück, aber mit Warnung
      return NextResponse.json(
        createApiResponse({
          ...resumeData,
          _warning: 'Some data fields may not meet validation requirements'
        })
      );
    }
  })
);

// DELETE Route für Resume löschen
export const DELETE = withErrorHandling(async (
  request: Request,
  context?: Record<string, unknown>
) => {
  // Await params according to Next.js 15 requirements
  const params = await (context as any)?.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      createApiResponse({ error: 'Resume ID is required' }, false),
      { status: 400 }
    );
  }

  // Skip actual deletion in development mode
  if (process.env.NODE_ENV === 'development' && 
      process.env.FIREBASE_PROJECT_ID === 'cv-parser-dev') {
    
    console.log(`🔧 Development mode: Skipping deletion of resume ${id}`);
    
    return NextResponse.json(
      createApiResponse({ 
        message: 'Resume deleted successfully (development mode - no actual deletion)' 
      })
    );
    
  } else {
    // Real deletion in production
    await db.collection('resumes').doc(id).delete();
    
    // Invalidiere den Cache
    await fetch(`/api/revalidate?tag=resume`);
    
    return NextResponse.json(
      createApiResponse({ message: 'Resume deleted successfully' })
    );
  }
});