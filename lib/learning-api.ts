import { getAuthHeaders } from './auth-headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api';

// Course API
export const getCourses = async (status?: string, category?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);

  const response = await fetch(`${API_BASE_URL}/courses?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const getCourse = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const getNextCourse = async () => {
  const response = await fetch(`${API_BASE_URL}/courses/next`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const createCourse = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateCourse = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteCourse = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return response.json();
};

// SubCourse API
export const getSubCourses = async (courseId: string) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/subcourses`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const createSubCourse = async (courseId: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/subcourses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateSubCourse = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/subcourses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const completeSubCourse = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/subcourses/${id}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const deleteSubCourse = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/subcourses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return response.json();
};

// Technology API
export const getTechnologies = async (status?: string, category?: string, type?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  if (type) params.append('type', type);

  const response = await fetch(`${API_BASE_URL}/technologies?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const getTechnology = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/technologies/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const getRoadmap = async () => {
  const response = await fetch(`${API_BASE_URL}/technologies/roadmap`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const createTechnology = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/technologies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateTechnology = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/technologies/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteTechnology = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/technologies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return response.json();
};
