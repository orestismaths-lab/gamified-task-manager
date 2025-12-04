"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/task-manager/api/admin/users");
        if (!res.ok) {
          throw new Error("Αποτυχία φόρτωσης χρηστών");
        }
        const data = (await res.json()) as { users: AdminUser[] };
        setUsers(
          data.users.map((u) => ({
            ...u,
            createdAt: u.createdAt,
          }))
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Σφάλμα κατά τη φόρτωση";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleResetPassword = async (user: AdminUser) => {
    const newPassword = window.prompt(
      `Νέο password για ${user.email} (τουλάχιστον 6 χαρακτήρες):`
    );
    if (!newPassword) return;
    if (newPassword.length < 6) {
      window.alert("Το password πρέπει να είναι τουλάχιστον 6 χαρακτήρες.");
      return;
    }

    setResettingId(user.id);
    setError(null);
    try {
      const res = await fetch("/task-manager/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Αποτυχία αλλαγής password");
      }

      window.alert(
        `Το password για τον χρήστη ${user.email} ενημερώθηκε επιτυχώς.`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Σφάλμα κατά την αλλαγή password";
      setError(message);
    } finally {
      setResettingId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const ok = window.confirm(
      `Να διαγραφεί ο χρήστης ${user.email}; Αυτό ΔΕΝ μπορεί να αναιρεθεί.`
    );
    if (!ok) return;

    setDeletingId(user.id);
    setError(null);
    try {
      const res = await fetch("/task-manager/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Αποτυχία διαγραφής χρήστη");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      window.alert(`Ο χρήστης ${user.email} διαγράφηκε.`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Σφάλμα κατά τη διαγραφή χρήστη";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              User Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Εδώ μπορείς να δεις όλους τους χρήστες και να τους αλλάζεις
              password αν χρειαστεί.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Φόρτωση χρηστών...
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Δεν υπάρχουν ακόμα χρήστες.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Όνομα
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Δημιουργήθηκε
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleString("el-GR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(user)}
                        disabled={resettingId === user.id}
                        className="inline-flex items-center rounded-full border border-blue-500 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                      >
                        {resettingId === user.id
                          ? "Αλλαγή..."
                          : "Reset password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === user.id ? "Διαγραφή..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          Σημείωση: Η σελίδα δεν είναι προς το παρόν προστατευμένη με ρόλους.
          Υπόθεσή μας είναι ότι το URL το χρησιμοποιείς μόνο εσύ (admin).
        </div>
      </div>
    </main>
  );
}


