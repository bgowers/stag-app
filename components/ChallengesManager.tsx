"use client";

import { supabase } from "@/lib/supabase";
import { Challenge } from "@/lib/types";
import { Edit2, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ChallengesManagerProps {
  gameId: string;
}

export default function ChallengesManager({ gameId }: ChallengesManagerProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    base_points: 0,
    bonus_points: 0,
    category: "",
    is_active: true,
    is_repeatable: false,
  });

  const fetchChallenges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("game_id", gameId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast.error("Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      base_points: 0,
      bonus_points: 0,
      category: "",
      is_active: true,
      is_repeatable: false,
    });
    setEditingChallenge(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a challenge title");
      return;
    }

    if (formData.base_points < 0) {
      toast.error("Base points cannot be negative");
      return;
    }

    try {
      if (editingChallenge) {
        // Update existing challenge
        const { error } = await supabase
          .from("challenges")
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            base_points: formData.base_points,
            bonus_points:
              formData.bonus_points > 0 ? formData.bonus_points : null,
            category: formData.category.trim() || null,
            is_active: formData.is_active,
            is_repeatable: formData.is_repeatable,
          })
          .eq("id", editingChallenge.id);

        if (error) throw error;
        toast.success("Challenge updated!");
      } else {
        // Create new challenge
        const { error } = await supabase.from("challenges").insert([
          {
            game_id: gameId,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            base_points: formData.base_points,
            bonus_points:
              formData.bonus_points > 0 ? formData.bonus_points : null,
            category: formData.category.trim() || null,
            is_active: formData.is_active,
            is_repeatable: formData.is_repeatable,
            sort_order: challenges.length,
          },
        ]);

        if (error) throw error;
        toast.success("Challenge created!");
      }

      resetForm();
      fetchChallenges();
    } catch (error) {
      console.error("Error saving challenge:", error);
      toast.error("Failed to save challenge");
    }
  };

  const handleEdit = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description || "",
      base_points: challenge.base_points,
      bonus_points: challenge.bonus_points || 0,
      category: challenge.category || "",
      is_active: challenge.is_active,
      is_repeatable: challenge.is_repeatable,
    });
    setEditingChallenge(challenge);
    setShowForm(true);
  };

  const handleDelete = async (challengeId: string, title: string) => {
    if (
      !confirm(`Delete "${title}"? This will also remove all related claims.`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId);

      if (error) throw error;

      setChallenges(challenges.filter((c) => c.id !== challengeId));
      toast.success("Challenge deleted");
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Failed to delete challenge");
    }
  };

  const handleToggleActive = async (challenge: Challenge) => {
    try {
      const { error } = await supabase
        .from("challenges")
        .update({ is_active: !challenge.is_active })
        .eq("id", challenge.id);

      if (error) throw error;

      setChallenges(
        challenges.map((c) =>
          c.id === challenge.id ? { ...c, is_active: !c.is_active } : c,
        ),
      );
      toast.success(
        challenge.is_active ? "Challenge hidden" : "Challenge shown",
      );
    } catch (error) {
      console.error("Error toggling challenge:", error);
      toast.error("Failed to update challenge");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-4 rounded-lg space-y-3 text-gray-700"
        >
          <h3 className="font-semibold text-lg">
            {editingChallenge ? "Edit Challenge" : "New Challenge"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Down your pint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Finish a full pint in under 10 seconds"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Points *
              </label>
              <input
                type="number"
                value={formData.base_points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_points: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus Points
              </label>
              <input
                type="number"
                value={formData.bonus_points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bonus_points: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., drinking, performance"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700"
              >
                Active (visible to players)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_repeatable"
                checked={formData.is_repeatable}
                onChange={(e) =>
                  setFormData({ ...formData, is_repeatable: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="is_repeatable"
                className="text-sm font-medium text-gray-700"
              >
                Repeatable (can be claimed multiple times)
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {editingChallenge ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg font-semibold text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Challenge
        </button>
      )}

      {/* Challenges List */}
      {challenges.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No challenges yet</p>
          <p className="text-sm mt-2">Add challenges to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                challenge.is_active
                  ? "bg-white border-gray-200"
                  : "bg-gray-50 border-gray-300 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">
                    {challenge.title}
                  </h4>
                  {challenge.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {challenge.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                      Base: {challenge.base_points}pts
                    </span>
                    {challenge.bonus_points && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                        Bonus: {challenge.bonus_points}pts
                      </span>
                    )}
                    {challenge.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {challenge.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(challenge)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={
                      challenge.is_active
                        ? "Hide from players"
                        : "Show to players"
                    }
                  >
                    {challenge.is_active ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(challenge)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit challenge"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(challenge.id, challenge.title)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete challenge"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 mt-2">
        {challenges.length}{" "}
        {challenges.length === 1 ? "challenge" : "challenges"}
      </div>
    </div>
  );
}
