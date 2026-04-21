import { Repository } from "../../core/decorators/decorators.js"
import BaseRepository from "../../core/orm/repository/Base.repository.js"
import Parking from "../entities/Parking.entity.js"

@Repository()
export class ParkingRepository extends BaseRepository<Parking> {

    constructor() {
        super(Parking)
    }

}

export default ParkingRepository
