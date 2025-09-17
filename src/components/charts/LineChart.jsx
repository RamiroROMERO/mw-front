import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { useLineChart } from './useLineChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({title="", labels=[], dataChart=[]}) => {

  const {data, options} = useLineChart({title, labels, dataChart});

  return (
    <Card className='mb-3'>
      <CardBody>
        <Line options={options} data={data} style={{display: 'inline'}}/>
      </CardBody>
    </Card>
  )
}

export default LineChart