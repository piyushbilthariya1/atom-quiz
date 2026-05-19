const API_URL =
  import.meta.env.VITE_API_URL || "https://shark-app-xxpms.ondigitalocean.app";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (identifier, password) => {
    const formData = new URLSearchParams();
    formData.append("username", identifier);
    formData.append("password", password);

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user_role", data.role);
    localStorage.setItem("username", data.username);

    if (data.role === "admin") {
      localStorage.setItem("admin_authenticated", "true");
    }
    return data;
  },

  registerAdmin: async (userData, orgName, inviteCode) => {
    const res = await fetch(
      `${API_URL}/api/auth/register/admin?org_name=${encodeURIComponent(orgName)}&invite_code=${encodeURIComponent(inviteCode)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      },
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Registration failed");
    }
    return res.json();
  },

  registerParticipant: async (userData, inviteCode) => {
    const res = await fetch(
      `${API_URL}/api/auth/register/participant?invite_code=${encodeURIComponent(inviteCode)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      },
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Registration failed");
    }
    return res.json();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
  },

  // Quizzes
  getQuizzes: async () => {
    const res = await fetch(`${API_URL}/api/quizzes/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch quizzes");
    return res.json();
  },

  getQuiz: async (id) => {
    const res = await fetch(`${API_URL}/api/quizzes/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch quiz");
    return res.json();
  },

  createQuiz: async (quizData) => {
    const res = await fetch(`${API_URL}/api/quizzes/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData),
    });
    if (!res.ok) throw new Error("Failed to create quiz");
    return res.json();
  },

  deleteQuiz: async (id) => {
    const res = await fetch(`${API_URL}/api/quizzes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete quiz");
    return true;
  },

  createRoom: async (quizId) => {
    const res = await fetch(`${API_URL}/api/create-room`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quiz_id: quizId }),
    });
    if (!res.ok) throw new Error("Failed to create room");
    return res.json();
  },
};
