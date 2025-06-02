// config/app.config.ts
export const appConfig = {
    company: {
      name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'getexperts',
      logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/getexperts_Logo%20white_2022_Logo-J8GvQFrl6vrMOgCpmr7p26XTKi8yl7.png',
      contact: {
        email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kontakt@getexperts.io',
        phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+49 2111 7607 313',
        address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Rudolfplatz 3, 50674 Köln',
      },
      social: {
        linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/company/getexperts',
        xing: process.env.NEXT_PUBLIC_XING_URL || 'https://xing.com/company/getexperts',
      }
    },
    features: {
      enablePdfExport: process.env.NEXT_PUBLIC_ENABLE_PDF_EXPORT !== 'false',
      enableWordExport: process.env.NEXT_PUBLIC_ENABLE_WORD_EXPORT !== 'false',
      enableJsonExport: process.env.NEXT_PUBLIC_ENABLE_JSON_EXPORT !== 'false',
      enableSearch: process.env.NEXT_PUBLIC_ENABLE_SEARCH !== 'false',
      enableFilters: process.env.NEXT_PUBLIC_ENABLE_FILTERS !== 'false',
      enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB default
    },
    api: {
      resumeParserUrl: process.env.NEXT_PUBLIC_RESUME_PARSER_URL || 'https://resumeparser.app/resume/parse',
      resumeParserApiKey: process.env.NEXT_PUBLIC_RESUME_PARSER_API,
      rateLimit: {
        maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX || '100'),
        windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),
      }
    },
    ui: {
      theme: {
        primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#4F46E5',
        secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#3B82F6',
      },
      defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'de',
      itemsPerPage: parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '10'),
    }
  };