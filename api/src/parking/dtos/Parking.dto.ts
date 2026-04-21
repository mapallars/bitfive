import DTO from "../../core/orm/dto/Base.dto.js"
import Parking from '../entities/Parking.entity.js'

export class ParkingDTO extends DTO<Parking> {
  constructor(entity: Partial<Parking>) {
    super(entity)
  }
}

export default ParkingDTO

