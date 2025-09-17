import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card, CardBody } from 'reactstrap';
import { usePieChart } from './usePieChart';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({title="", labels=[], dataChart=[]}) => {

  const {options, data} = usePieChart({title, labels, dataChart});

  return (
    <Card className='mb-3'>
      <CardBody>
        <Pie options={options} data={data}/>
      </CardBody>
    </Card>
  )
}

export default PieChart