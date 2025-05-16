import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Mail, Link as LinkIcon, FileImage, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CreateConferencePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialty: '',
    city: '',
    country: '',
    date: '',
    time: '',
    organizer_email: '',
    image_url: '',
    link: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('conferences')
        .insert([formData]);

      if (error) throw error;

      navigate('/conferencezone');
    } catch (error) {
      console.error('Error creating conference:', error);
      alert('Error creating conference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create Conference</h1>
            <p className="mt-2 text-gray-600">Submit a new medical conference to the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Conference Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                placeholder="Enter conference title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                placeholder="Enter conference description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Medical Specialty</label>
              <select
                name="specialty"
                required
                value={formData.specialty}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">Select specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="General Practice">General Practice</option>
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <div className="mt-1 flex items-center">
                  <MapPin size={20} className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <div className="mt-1 flex items-center">
                  <Calendar size={20} className="mr-2 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <div className="mt-1 flex items-center">
                  <Clock size={20} className="mr-2 text-gray-400" />
                  <input
                    type="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Organizer Email</label>
              <div className="mt-1 flex items-center">
                <Mail size={20} className="mr-2 text-gray-400" />
                <input
                  type="email"
                  name="organizer_email"
                  required
                  value={formData.organizer_email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  placeholder="Enter organizer email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Conference Link</label>
              <div className="mt-1 flex items-center">
                <LinkIcon size={20} className="mr-2 text-gray-400" />
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  placeholder="Enter conference link (Zoom, YouTube, etc.)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <div className="mt-1 flex items-center">
                <FileImage size={20} className="mr-2 text-gray-400" />
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  placeholder="Enter image URL"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/conferencezone')}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
              >
                {loading ? 'Creating...' : 'Create Conference'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateConferencePage;