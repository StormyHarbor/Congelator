import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FoodItem } from '../types';

interface StatsViewProps {
  items: FoodItem[];
}

const COLORS = ['#2C4642', '#C87941', '#5C7672', '#D9A478', '#8B4513', '#A0522D'];

export const StatsView: React.FC<StatsViewProps> = ({ items }) => {
  // Aggregate data by Category
  const dataMap = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(dataMap).map((key) => ({
    name: key,
    value: dataMap[key],
  }));

  if (items.length === 0) return null;

  return (
    <div className="w-full h-48 mb-6">
      <h3 className="text-center text-[#5C7672] text-xs font-bold uppercase tracking-widest mb-2">Répartition du stock</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#2C4642' }}
            itemStyle={{ color: '#2C4642', fontWeight: 'bold' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};