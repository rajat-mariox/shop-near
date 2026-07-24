import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts';

const data = [
  { name: 'Jan', avgSale: 210000000, avgItem: 330000000 },
  { name: 'Feb', avgSale: 220000000, avgItem: 340000000 },
  { name: 'Mar', avgSale: 215000000, avgItem: 335000000 },
  { name: 'Apr', avgSale: 225000000, avgItem: 345000000 },
  { name: 'May', avgSale: 230000000, avgItem: 350000000 },
  { name: 'Jun', avgSale: 240000000, avgItem: 355000000 },
  { name: 'Jul', avgSale: 250000000, avgItem: 360000000 },
  { name: 'Aug', avgSale: 260000000, avgItem: 370000000 },
  { name: 'Sep', avgSale: 255000000, avgItem: 365000000 },
  { name: 'Oct', avgSale: 265000000, avgItem: 375000000 },
  { name: 'Nov', avgSale: 270000000, avgItem: 380000000 },
  { name: 'Dec', avgSale: 275000000, avgItem: 385000000 },
];

const SalesChart = () => (
  <div style={{
    flex: 2,
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    minWidth: 0,
    minHeight: 300
  }}>
    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Your Sales this year</div>
    <div style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>
      <span style={{ color: '#27ae60', fontWeight: 600 }}>■ Average Sale Value</span>
      &nbsp;&nbsp;
      <span style={{ color: '#2980b9', fontWeight: 600 }}>■ Average item per sale</span>
    </div>
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} />
          <Tooltip formatter={v => `$${v.toLocaleString()}`} />
          <Legend />
          <Line type="monotone" dataKey="avgSale" stroke="#27ae60" strokeWidth={3} dot={false} name="Average Sale Value" />
          <Line type="monotone" dataKey="avgItem" stroke="#FF6051" strokeWidth={3} dot={false} name="Average item per sale" strokeDasharray="6 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div style={{ marginTop: 16, fontSize: 12, color: '#888', textAlign: 'center' }}>
      Jan &nbsp; Feb &nbsp; Mar &nbsp; Apr &nbsp; May &nbsp; Jun &nbsp; Jul &nbsp; Aug &nbsp; Sep &nbsp; Oct &nbsp; Nov &nbsp; Dec
    </div>
  </div>
);

export default SalesChart;