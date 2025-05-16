import React, { useState } from 'react';
import { Video, Users, Calendar, Settings, Plus, Search, Clock, Star, Lock, Globe, Crown, Share2, MonitorPlay, FileVideo, BookOpen, CalendarDays, MapPin, Tag, DollarSign } from 'lucide-react';

const ZomZonePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'rooms' | 'conferences'>('meetings');

  const upcomingMeetings = [
    {
      id: 1,
      title: 'Advanced Cardiac Surgery Techniques Workshop',
      time: '2:00 PM Today',
      participants: 25,
      type: 'workshop',
      host: 'Dr. Sarah Chen',
      duration: '2 hours',
    },
    {
      id: 2,
      title: 'Case Discussion: Complex Neurological Presentation',
      time: '4:30 PM Today',
      participants: 8,
      type: 'case',
      host: 'Dr. Michael Brown',
      duration: '1 hour',
    },
    {
      id: 3,
      title: 'Research Protocol Review: New Cancer Treatment',
      time: '10:00 AM Tomorrow',
      participants: 12,
      type: 'research',
      host: 'Dr. Emily Wong',
      duration: '1.5 hours',
    },
  ];

  const rooms = [
    {
      id: 1,
      name: 'Medical Education Symposium',
      status: 'active',
      participants: 45,
      type: 'public',
      host: 'Dr. James Wilson',
      topic: 'Latest Advances in Medical Education',
    },
    {
      id: 2,
      title: 'Pediatric Case Conference',
      status: 'active',
      participants: 15,
      type: 'private',
      host: 'Dr. Lisa Martinez',
      topic: 'Challenging Cases in Pediatric Care',
    },
    {
      id: 3,
      title: 'Research Methodology Workshop',
      status: 'scheduled',
      participants: 0,
      type: 'premium',
      host: 'Dr. Robert Johnson',
      topic: 'Advanced Statistical Methods in Medical Research',
    },
  ];

  const conferences = [
    {
      id: 1,
      title: 'International Cardiology Summit 2025',
      date: '2025-06-15',
      time: '09:00 AM',
      location: 'Virtual Conference',
      organizer: 'European Society of Cardiology',
      seats: {
        total: 1000,
        booked: 645,
      },
      price: 299,
      tags: ['Cardiology', 'Research', 'CME Credits'],
    },
    {
      id: 2,
      title: 'Neurology Updates & Case Studies',
      date: '2025-07-01',
      time: '10:00 AM',
      location: 'Virtual Conference',
      organizer: 'American Academy of Neurology',
      seats: {
        total: 500,
        booked: 198,
      },
      price: 199,
      tags: ['Neurology', 'Case Studies', 'CME Credits'],
    },
    {
      id: 3,
      title: 'Future of Medical AI Symposium',
      date: '2025-08-20',
      time: '08:00 AM',
      location: 'Virtual Conference',
      organizer: 'Medical AI Research Group',
      seats: {
        total: 2000,
        booked: 1876,
      },
      price: 149,
      tags: ['AI', 'Technology', 'Innovation'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ZomZone</h1>
          <p className="mt-2 text-gray-600">Your virtual medical conference space</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          <button className="flex items-center justify-center space-x-2 rounded-lg bg-purple-600 p-4 text-white transition-all hover:bg-purple-700">
            <Video size={24} />
            <span className="font-medium">Start Meeting</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rounded-lg bg-white p-4 text-gray-700 shadow-md transition-all hover:bg-gray-50">
            <MonitorPlay size={24} />
            <span className="font-medium">Host Lecture</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rounded-lg bg-white p-4 text-gray-700 shadow-md transition-all hover:bg-gray-50">
            <FileVideo size={24} />
            <span className="font-medium">Record Session</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rounded-lg bg-white p-4 text-gray-700 shadow-md transition-all hover:bg-gray-50">
            <Plus size={24} />
            <span className="font-medium">New Conference</span>
          </button>
          <button className="flex items-center justify-center space-x-2 rounded-lg bg-white p-4 text-gray-700 shadow-md transition-all hover:bg-gray-50">
            <CalendarDays size={24} />
            <span className="font-medium">View Calendar</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Meeting Controls */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quick Join</h2>
                <Settings size={20} className="text-gray-500" />
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter meeting code"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-purple-600 px-4 py-1 text-sm text-white hover:bg-purple-700">
                    Join
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Need a meeting code?</span>
                  <button className="text-purple-600 hover:underline">Create one</button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold">Your Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">32</p>
                  <p className="text-sm text-gray-600">Hours Taught</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">248</p>
                  <p className="text-sm text-gray-600">Participants</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-gray-600">Workshops</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">4.9</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle and Right Columns */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow-md">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 border-b-2 px-6 py-4 text-center font-medium ${
                    activeTab === 'meetings'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('meetings')}
                >
                  Upcoming Sessions
                </button>
                <button
                  className={`flex-1 border-b-2 px-6 py-4 text-center font-medium ${
                    activeTab === 'rooms'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('rooms')}
                >
                  Active Rooms
                </button>
                <button
                  className={`flex-1 border-b-2 px-6 py-4 text-center font-medium ${
                    activeTab === 'conferences'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('conferences')}
                >
                  Conferences
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'meetings' && (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-purple-100 p-2">
                            {meeting.type === 'workshop' && <MonitorPlay size={24} className="text-purple-600" />}
                            {meeting.type === 'case' && <Users size={24} className="text-purple-600" />}
                            {meeting.type === 'research' && <BookOpen size={24} className="text-purple-600" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{meeting.title}</h3>
                            <p className="text-sm text-gray-500">Hosted by {meeting.host}</p>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {meeting.time}
                              </span>
                              <span className="flex items-center">
                                <Users size={14} className="mr-1" />
                                {meeting.participants} registered
                              </span>
                              <span>{meeting.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200">
                            <Share2 size={16} />
                          </button>
                          <button className="rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700">
                            Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'rooms' && (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-purple-100 p-2">
                            {room.type === 'public' && <Globe size={24} className="text-purple-600" />}
                            {room.type === 'private' && <Lock size={24} className="text-purple-600" />}
                            {room.type === 'premium' && <Crown size={24} className="text-purple-600" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{room.name}</h3>
                            <p className="text-sm text-gray-500">Hosted by {room.host}</p>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Users size={14} className="mr-1" />
                                {room.participants} online
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  room.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {room.status === 'active' ? 'Live' : 'Starting Soon'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200">
                            <Share2 size={16} />
                          </button>
                          <button className="rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700">
                            {room.status === 'active' ? 'Join' : 'Notify Me'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'conferences' && (
                  <div className="space-y-6">
                    {conferences.map((conference) => (
                      <div
                        key={conference.id}
                        className="rounded-lg border border-gray-200 p-6 hover:bg-gray-50"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{conference.title}</h3>
                            <p className="text-gray-600">{conference.organizer}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">${conference.price}</p>
                            <p className="text-sm text-gray-500">per ticket</p>
                          </div>
                        </div>
                        
                        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            {conference.date}
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {conference.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            {conference.location}
                          </div>
                          <div className="flex items-center">
                            <Users size={16} className="mr-1" />
                            {conference.seats.booked} / {conference.seats.total} seats booked
                          </div>
                        </div>
                        
                        <div className="mb-4 flex flex-wrap gap-2">
                          {conference.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
                              <Star size={16} />
                              <span>Save</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
                              <Share2 size={16} />
                              <span>Share</span>
                            </button>
                          </div>
                          <button
                            className={`rounded-md px-6 py-2 text-sm font-medium ${
                              conference.seats.booked >= conference.seats.total
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                            disabled={conference.seats.booked >= conference.seats.total}
                          >
                            {conference.seats.booked >= conference.seats.total
                              ? 'Sold Out'
                              : 'Book Seat'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZomZonePage;