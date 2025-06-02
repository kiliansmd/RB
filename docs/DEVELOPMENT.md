# Development Guide

This document outlines the development setup and mock data structure for the CV Parser System.

## Development Mode

The application automatically switches to development mode when:
- Running in `NODE_ENV=development`
- Missing Firebase credentials
- Missing Resume Parser API key

## Mock Data Structure

Mock data is organized in the following structure:

```
data/
  mock/
    index.ts       # Main mock data exports
    resumes.ts     # Resume mock data
    kandidaten.ts  # Candidate mock data
    managers.ts    # Account manager mock data
```

### Types

All mock data follows TypeScript interfaces defined in `types/index.ts`:

- `Resume`: Basic resume information
- `Kandidat`: Detailed candidate profile
- `AccountManager`: Account manager information

## Development Configuration

The development configuration is managed in `config/dev.config.ts` and includes:

- Development mode settings
- Mock data settings
- API rate limiting
- Firebase configuration
- Resume parser settings
- Logging configuration

## API Routes

The following API routes support mock data:

- `GET /api/get-resumes`: List resumes with filtering
- `GET /api/resume/[id]`: Get single resume details
- `POST /api/parse-resume`: Parse uploaded resume

## Adding New Mock Data

To add new mock data:

1. Add the data to the appropriate mock data file in `data/mock/`
2. Update the corresponding TypeScript interface in `types/index.ts`
3. Add any necessary helper functions in the mock data file

Example:

```typescript
// data/mock/resumes.ts
export const mockResumes: Resume[] = [
  {
    id: 'new-resume-1',
    name: 'New Candidate',
    // ... other fields
  }
];

// Helper function
export const getMockResumeById = (id: string): Resume | undefined => {
  return mockResumes.find(resume => resume.id === id);
};
```

## Testing

Mock data is particularly useful for testing. You can:

1. Use the mock data directly in tests
2. Extend mock data for specific test cases
3. Use the development configuration to control test behavior

Example test:

```typescript
import { mockResumes } from '@/data/mock';

describe('Resume API', () => {
  it('should return mock resumes in development mode', async () => {
    const response = await fetch('/api/get-resumes');
    const data = await response.json();
    expect(data.data).toEqual(mockResumes);
  });
});
```

## Best Practices

1. Always use TypeScript interfaces for mock data
2. Keep mock data realistic but anonymized
3. Use helper functions for common operations
4. Document any special mock data behavior
5. Keep mock data in sync with real data structure 