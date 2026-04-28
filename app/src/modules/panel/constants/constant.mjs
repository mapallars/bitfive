export class Constant {
    static fromKey(constant, key) {
        return constant.find((item) => item.key === key)?.value
    }

    static fromValue(constant, value) {
        return constant.find((item) => item.value === value)?.key
    }
}

export default Constant