import { PieChart } from '@mui/x-charts';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const settings = {
  margin: { right: 5 },
  width: 500,
  height: 500,
  hideLegend: false,
};

const AttendancePieChart = ({ attendance }) => {
  if (!attendance) {
    return null;
  }

  const present = Number(attendance.present) || 0;
  const absent = Number(attendance.absent) || 0;
  const leave = Number(attendance.leave) || 0;

  const data = [
    { label: 'Present', value: present, color: '#059669' },
    { label: 'Absent', value: absent, color: '#dc2626' },
    { label: 'Leave', value: leave, color: '#d97706' },
  ].filter((item) => Number(item.value) > 0);

  const isEmpty = present === 0 && absent === 0 && leave === 0;

  if (isEmpty) {
    return (
      <div className='flex items-center justify-center'>
        <Gauge
          value={0}
          width={500}
          height={500}
          sx={{
            [`& .${gaugeClasses.valueArc}`]: {
              fill: '#94a3b8',
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: '#e2e8f0',
            },
            [`& .${gaugeClasses.valueText}`]: {
              fill: '#475569',
            },
            [`& .${gaugeClasses.valueText} text`]: {
              fill: '#475569',
            },
          }}
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center text-slate-600'>
        No attendance data available.
      </div>
    );
  }

  return (
    <PieChart
      series={[{
        innerRadius: 50,
        outerRadius: 200,
        data,
        arcLabel: 'value',
      }]}
      {...settings}
    />
  );
};

export default AttendancePieChart;
