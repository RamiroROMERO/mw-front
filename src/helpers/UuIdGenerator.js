import { v4 as uuidv4 } from 'uuid';
const UuIdGenerator = () => {

  const currentID = uuidv4();

  return currentID;

}

const RandomCodeGenerator = () => {

  const currentCode = uuidv4();
  return currentCode.slice(0, 8);

}

export { UuIdGenerator, RandomCodeGenerator };