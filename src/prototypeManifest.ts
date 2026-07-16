// Generated from dataverse/planning-payload.json (rebranded to Project Tracker).
export const prototypeManifest = {
  generatedFrom: 'dataverse/planning-payload.json',
  feedbackPath: 'dataverse/prototype-feedback.md',
  entities: [
    {
      displayName: 'Project',
      collectionName: 'projects',
      description: 'A project delivered by a team for a client, in a practice area',
      mockDataFile: 'src/mockData/project.ts',
      repositoryName: 'ProjectRepository',
    },
    {
      displayName: 'Resource',
      collectionName: 'resources',
      description: 'A reusable asset that backs one or more projects; lives in a shared library',
      mockDataFile: 'src/mockData/resource.ts',
      repositoryName: 'ResourceRepository',
    },
    {
      displayName: 'Assignment',
      collectionName: 'assignments',
      description: 'Junction record: a project used a resource',
      mockDataFile: 'src/mockData/assignment.ts',
      repositoryName: 'AssignmentRepository',
    },
  ],
} as const;
