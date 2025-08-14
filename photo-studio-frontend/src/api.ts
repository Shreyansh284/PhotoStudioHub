// Lightweight API client for the frontend
// Handles auth token, JSON requests, and multipart uploads

export type ApiSuccess<T> = {
	status: string;
	data: T;
	results?: number;
	token?: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api/v1";

function getToken(): string | null {
	try {
		return localStorage.getItem("token");
	} catch {
		return null;
	}
}

function authHeaders(extra: HeadersInit = {}): HeadersInit {
	const token = getToken();
	return {
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...extra,
	};
}

const DEFAULT_TIMEOUT_MS = 20000; // 20s

async function handleResponse<T>(res: Response): Promise<T> {
	const contentType = res.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");
	const body = isJson ? await res.json() : await res.text();
		if (!res.ok) {
			const message = isJson ? body?.message || body?.error || res.statusText : res.statusText;
			const err = new Error(message || `Request failed with ${res.status}`) as any;
			err.status = res.status;
			err.details = body;
			throw err;
		}
	return body as T;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS);
	try {
		const res = await fetch(input, { ...init, signal: controller.signal });
		return res;
	} finally {
		clearTimeout(timeout);
	}
}

export async function apiGet<T>(path: string): Promise<T> {
	const res = await fetchWithTimeout(`${API_BASE}${path}`, {
		method: "GET",
		headers: authHeaders({ Accept: "application/json" }),
	});
	return handleResponse<T>(res);
}

export async function apiPostJson<T, B = unknown>(path: string, body: B): Promise<T> {
	const res = await fetchWithTimeout(`${API_BASE}${path}`, {
		method: "POST",
		headers: authHeaders({ "Content-Type": "application/json", Accept: "application/json" }),
		body: JSON.stringify(body),
	});
	return handleResponse<T>(res);
}

export async function apiPatchJson<T, B = unknown>(path: string, body: B): Promise<T> {
	const res = await fetchWithTimeout(`${API_BASE}${path}`, {
		method: "PATCH",
		headers: authHeaders({ "Content-Type": "application/json", Accept: "application/json" }),
		body: JSON.stringify(body),
	});
	return handleResponse<T>(res);
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
	const res = await fetchWithTimeout(`${API_BASE}${path}`, {
		method: "DELETE",
		headers: authHeaders({ Accept: "application/json" }),
	});
	return handleResponse<T>(res);
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
	const res = await fetchWithTimeout(`${API_BASE}${path}`, {
		method: "POST",
		headers: authHeaders(), // Let the browser set multipart boundary
		body: formData,
	});
	return handleResponse<T>(res);
}

// High-level endpoints

// Auth
export async function login(email: string, password: string): Promise<string> {
	const result = await apiPostJson<ApiSuccess<{ token: string }>>("/auth/login", { email, password });
	// Some controllers return { token } at root; support both
	const token = (result as any).token || (result.data as any)?.token;
	if (!token) throw new Error("No token returned from server");
	return token;
}

export type BackendUser = { id: string; email: string; role?: string };
export async function getMe(): Promise<BackendUser> {
	const res = await apiGet<ApiSuccess<{ user: BackendUser }>>("/auth/me");
	// Controller returns { data: { user } }
	return (res.data as any).user;
}

// Clients
export type BackendPhoto = { url: string; public_id: string };
export type BackendCollection = { _id: string; name: string; space: string; photos?: BackendPhoto[] };
export type BackendSpace = { _id: string; name: string; client: string; shareableLink: string; collections?: BackendCollection[] };
export type BackendClient = { _id: string; name: string; email: string; spaces?: BackendSpace[] };

export async function getClients(): Promise<BackendClient[]> {
	const res = await apiGet<ApiSuccess<{ clients: BackendClient[] }> & { results?: number }>("/clients");
	return (res.data as any).clients || [];
}

export async function createClient(input: { name: string; email: string }): Promise<BackendClient> {
	const res = await apiPostJson<ApiSuccess<{ client: BackendClient }>>("/clients", input);
	return (res.data as any).client;
}

// Spaces
export async function createSpace(input: { name: string; clientId: string }): Promise<BackendSpace> {
	const body = { name: input.name, client: input.clientId };
	const res = await apiPostJson<ApiSuccess<{ space: BackendSpace }>>("/spaces", body);
	return (res.data as any).space;
}

export async function getSpace(spaceId: string): Promise<BackendSpace> {
	const res = await apiGet<ApiSuccess<{ space: BackendSpace }>>(`/spaces/${spaceId}`);
	return (res.data as any).space;
}

// Collections
export async function createCollection(spaceId: string, name: string): Promise<BackendCollection> {
	const res = await apiPostJson<ApiSuccess<{ collection: BackendCollection }>>(`/spaces/${spaceId}/collections`, { name });
	return (res.data as any).collection;
}

export async function getCollection(collectionId: string): Promise<BackendCollection> {
	const res = await apiGet<ApiSuccess<{ collection: BackendCollection }>>(`/collections/${collectionId}`);
	return (res.data as any).collection;
}

export async function uploadPhotos(collectionId: string, files: File[]): Promise<BackendCollection> {
	const form = new FormData();
	files.forEach((file) => form.append("photos", file));
	const res = await apiPostForm<ApiSuccess<{ collection: BackendCollection }>>(`/collections/${collectionId}/photos`, form);
	return (res.data as any).collection;
}

export async function deletePhoto(collectionId: string, photoPublicId: string): Promise<BackendCollection> {
	const res = await apiDelete<ApiSuccess<{ collection: BackendCollection }>>(`/collections/${collectionId}/photos/${encodeURIComponent(photoPublicId)}`);
	// Some delete routes may return 200 with updated collection; support that
	return (res as any)?.data?.collection ?? (res as any)?.collection ?? (res as any);
}

export async function deleteAllPhotos(collectionId: string): Promise<BackendCollection> {
	const res = await apiDelete<ApiSuccess<{ collection: BackendCollection }>>(`/collections/${collectionId}/photos`);
	return (res as any)?.data?.collection ?? (res as any)?.collection ?? (res as any);
}

// Public gallery
export type PublicPhoto = { url: string; public_id: string };
export type PublicCollection = { _id: string; name: string; photos: PublicPhoto[] };
export type PublicClient = { name: string; email: string };
export type PublicSpace = { _id: string; name: string; shareableLink: string; client: PublicClient; collections: PublicCollection[] };

export async function getPublicSpaceByLink(link: string): Promise<PublicSpace> {
	const res = await apiGet<ApiSuccess<{ space: PublicSpace }>>(`/spaces/share/${encodeURIComponent(link)}`);
	return (res.data as any).space;
}

export type UploadResult = { id: string; url: string; title?: string };

/**
 * Upload a single photo to a collection with progress callback.
 * Expects backend route: POST /api/collections/:id/photos (multipart/form-data)
 * Form fields: file, relativePath? (optional)
 */
export function uploadPhotoToCollection(
  collectionId: string,
  file: File,
  onProgress?: (percent: number) => void,
  relativePath?: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    if (relativePath) form.append('relativePath', relativePath);

    const xhr = new XMLHttpRequest();
	xhr.open('POST', `${API_BASE}/collections/${encodeURIComponent(collectionId)}/photos`);
    xhr.responseType = 'json';

    xhr.upload.onprogress = evt => {
      if (onProgress && evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as UploadResult);
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(form);
  });
}
