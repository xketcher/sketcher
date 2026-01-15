
import React from 'react';
import { MOCK_ANALYTICS } from '../constants';
import { BarChart3, TrendingUp, Heart, MessageCircle, Share2, ArrowLeft, Calendar } from 'lucide-react';

interface AnalyticsProps {
  onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
  const data = MOCK_ANALYTICS;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">Post Insights</h2>
      </div>

      <div className="p-6">
        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Heart size={20} fill="currentColor" />
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Likes</span>
            </div>
            <p className="text-3xl font-black text-indigo-900">{data.totalLikes.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-500 font-bold">
              <TrendingUp size={12} />
              +12% vs last week
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-3xl border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-600 p-2 rounded-xl text-white">
                <MessageCircle size={20} fill="currentColor" />
              </div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Total Comments</span>
            </div>
            <p className="text-3xl font-black text-purple-900">{data.totalComments.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-purple-500 font-bold">
              <TrendingUp size={12} />
              +5.2% vs last week
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Share2 size={20} />
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Shares</span>
            </div>
            <p className="text-3xl font-black text-blue-900">{data.totalShares.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-blue-500 font-bold">
              <TrendingUp size={12} />
              +24% vs last week
            </div>
          </div>

          <div className="bg-green-50 p-5 rounded-3xl border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-600 p-2 rounded-xl text-white">
                <BarChart3 size={20} />
              </div>
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Eng. Rate</span>
            </div>
            <p className="text-3xl font-black text-green-900">{data.engagementRate}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-500 font-bold">
              <TrendingUp size={12} />
              Optimal Performance
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">Engagement over 7 days</h3>
            <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
              <Calendar size={14} />
              Last 7 Days
            </button>
          </div>
          
          <div className="flex items-end justify-between h-48 gap-2">
            {data.history.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-white rounded-t-lg relative flex flex-col justify-end h-full overflow-hidden border border-gray-200">
                  <div 
                    className="w-full bg-indigo-500 transition-all duration-500 ease-out group-hover:bg-indigo-600"
                    style={{ height: `${(day.likes / 1100) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-4">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider px-1">Recent Performance</h3>
          {data.history.slice(0, 3).map((day, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
              <div>
                <p className="font-bold text-sm">Activity on {day.date}</p>
                <p className="text-xs text-gray-400">Stable engagement flow</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-indigo-600">{day.likes} <span className="opacity-50">L</span></span>
                <span className="text-purple-600">{day.comments} <span className="opacity-50">C</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
