import { useNavigate } from 'react-router-dom'
import { Header, IconButton } from '../components/Layout'
import { ReconCalculator } from '../components/ReconCalculator'
import { Disclaimer } from '../components/Eyebrow'
import { IconChevron } from '../components/icons'

export default function Calculator() {
  const navigate = useNavigate()
  return (
    <>
      <Header
        eyebrow="SYS.CALC // RECONSTITUIÇÃO"
        title="Calculadora"
        right={
          <IconButton label="Voltar" onClick={() => navigate('/biblioteca')}>
            <IconChevron width={20} height={20} className="rotate-180" />
          </IconButton>
        }
      />
      <ReconCalculator />
      <Disclaimer className="mt-6" />
    </>
  )
}
