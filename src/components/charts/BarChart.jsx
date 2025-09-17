import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { useLineChart } from './useLineChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({title="", labels=[], dataChart=[], type="x"}) => {

  const {data, options} = useLineChart({title, labels, dataChart, type});

  return (
    <Card className='mb-3'>
      <CardBody>
        <Bar options={options} data={data} redraw={true} updateMode='default' />
      </CardBody>
    </Card>
  )
}

export default BarChart