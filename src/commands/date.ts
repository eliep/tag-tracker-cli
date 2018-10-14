const moment = require("moment");
import { Moment } from "moment";


export class DateRange {
    lowerDate: Moment;
    upperDate: Moment;

    constructor(lowerDate: Moment, upperDate: Moment) {
        this.upperDate = upperDate;
        this.lowerDate = lowerDate;
    }

    contains(date: Moment) {
        return (
            ( this.upperDate == null || date.isBefore(this.upperDate) ) &&
            ( this.lowerDate == null || date.isAfter(this.lowerDate) )
        )
    }

    static build (size: number, future: boolean) {
        const lowerDate = (size > 0) ? moment().subtract(size, 'days') : null;
        const upperDate = !future ? moment() : null;
        return new DateRange(lowerDate, upperDate);
    }
}
