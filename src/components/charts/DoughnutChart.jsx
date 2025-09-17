import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { usePieChart } from './usePieChart';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({title="", labels=[], dataChart=[]}) => {

  const {options, data} = usePieChart({title, labels, dataChart});

  return (
    <Card className='mb-3'>
      <CardBody>
        <Doughnut options={options} data={data} redraw={true} />
      </CardBody>
    </Card>
  )
}

export default DoughnutChart