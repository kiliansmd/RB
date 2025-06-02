import { NextResponse } from 'next/server';
import { db, isFirebaseMockMode } from '@/lib/firebase';
import { withErrorHandling, withRateLimit } from '@/lib/api-middleware';
import { searchSchema, createApiResponse } from '@/utils/validation';
import { devConfig } from '@/config/dev.config';
import { mockResumes } from '@/data/mock';
import { Resume } from '@/types';

export const GET = withRateLimit(100, 60000)(
  withErrorHandling(async (request: Request) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const seniority = searchParams.get('seniority') || '';
    const skills = searchParams.get('skills') || '';

    let resumes: Resume[];

    if (isFirebaseMockMode()) {
      console.log('🔄 Using mock data - Firebase not initialized');
      resumes = mockResumes;
    } else {
      console.log('🔥 Using Firebase data');
      const query = db.collection('resumes');
      const snapshot = await query.get();
      resumes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // Apply filters
    if (search) {
      resumes = resumes.filter(resume => 
        resume.name?.toLowerCase().includes(search.toLowerCase()) ||
        resume.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (location) {
      resumes = resumes.filter(resume => 
        resume.contact?.location_city?.toLowerCase().includes(location.toLowerCase()) ||
        resume.contact?.location_country?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (seniority) {
      resumes = resumes.filter(resume => 
        resume.senioritaet?.toLowerCase() === seniority.toLowerCase()
      );
    }

    if (skills) {
      const skillsList = skills.toLowerCase().split(',').map(s => s.trim());
      resumes = resumes.filter(resume => 
        resume.skills?.some(skill => 
          skillsList.includes(skill.toLowerCase())
        )
      );
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const paginatedResumes = resumes.slice(start, start + limit);

    return NextResponse.json(createApiResponse({
      data: paginatedResumes,
      total: resumes.length,
      page,
      limit,
      hasMore: start + limit < resumes.length
    }));
  })
);