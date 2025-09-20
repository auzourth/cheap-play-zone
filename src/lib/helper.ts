export const parseStepData = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return { status: 'null', timestamp: Date.now() }; // Default step if parsing fails
  }
};
