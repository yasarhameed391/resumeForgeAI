import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ResumeForge AI API',
      version: '1.0.0',
      description: 'AI-powered resume building API using Ollama',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Resume: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fileName: { type: 'string' },
            fileType: { type: 'string', enum: ['pdf', 'docx'] },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        JobDescription: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            company: { type: 'string' },
            content: { type: 'string' },
            extractedKeywords: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ATSReport: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            resumeId: { type: 'string' },
            jobId: { type: 'string' },
            score: { type: 'number' },
            matchedKeywords: { type: 'array', items: { type: 'string' } },
            missingKeywords: { type: 'array', items: { type: 'string' } },
            suggestions: { type: 'array', items: { type: 'string' } },
            beforeTailoring: { type: 'boolean' },
            tailoredResume: { type: 'string' },
            tailoredScore: { type: 'number' },
            saved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      requestBodies: {
        AnalyzeRequest: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resumeId', 'jobId'],
                properties: {
                  resumeId: { type: 'string' },
                  jobId: { type: 'string' },
                },
              },
            },
          },
        },
        JobCreateRequest: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content', 'title'],
                properties: {
                  content: { type: 'string' },
                  title: { type: 'string' },
                  company: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/resumes/upload': {
        post: {
          summary: 'Upload a resume',
          tags: ['Resumes'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['resume'],
                  properties: {
                    resume: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Resume uploaded successfully' },
            '400': { description: 'Invalid file type' },
          },
        },
      },
      '/resumes': {
        get: {
          summary: 'Get all resumes',
          tags: ['Resumes'],
          responses: {
            '200': { description: 'List of resumes' },
          },
        },
      },
      '/jobs': {
        post: {
          summary: 'Create a job description',
          tags: ['Jobs'],
          requestBody: {
            $ref: '#/components/requestBodies/JobCreateRequest',
          },
          responses: {
            '201': { description: 'Job description created' },
          },
        },
        get: {
          summary: 'Get all job descriptions',
          tags: ['Jobs'],
          responses: {
            '200': { description: 'List of job descriptions' },
          },
        },
      },
      '/ats/analyze': {
        post: {
          summary: 'Analyze resume against job description',
          tags: ['ATS'],
          requestBody: {
            $ref: '#/components/requestBodies/AnalyzeRequest',
          },
          responses: {
            '201': { description: 'Analysis complete' },
          },
        },
      },
      '/ats/history': {
        get: {
          summary: 'Get ATS analysis history',
          tags: ['ATS'],
          responses: {
            '200': { description: 'List of analysis reports' },
          },
        },
      },
      '/ats/tailor': {
        post: {
          summary: 'Tailor resume using AI',
          tags: ['ATS'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reportId'],
                  properties: {
                    reportId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Resume tailored successfully' },
          },
        },
      },
      '/ats/save': {
        post: {
          summary: 'Save tailored resume (requires score >= 90)',
          tags: ['ATS'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reportId'],
                  properties: {
                    reportId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Resume saved' },
            '400': { description: 'Score too low to save' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);