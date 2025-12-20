import { IntlMessages } from '@/helpers/Utils'

const TextTitle = ({title="", subTitle=""}) => {
  return (
    <div className="float-left float-none-xs mb-2">
      <div className="d-inline-block">
        <h6 className="d-inline">
          {IntlMessages(title)}
        </h6>
        <span className="text-muted text-medium d-block">
          {subTitle}
        </span>
      </div>
    </div>
  )
}

export default TextTitle