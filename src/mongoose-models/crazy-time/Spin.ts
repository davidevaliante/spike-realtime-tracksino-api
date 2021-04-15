import mongoose from 'mongoose'
import { prop, getModelForClass, ReturnModelType } from '@typegoose/typegoose';

export class Spin {
    // unique identifier
    @prop({required : true})
    public _id! :  string;

    // time related - when the spin occurred
    @prop({required : true})
    public timeOfSpin! : number;
    @prop({required : true})
    public rawTime! : string;
    @prop({required : true})
    public date! : Date;

    
    @prop({required : true}) 
    public slotResultSymbol! : string;
    @prop({required : true})
    public slotResult! : string;

    @prop({required : true})
    public spinResultSymbol! : string;

    @prop({required : true})
    public multiplier! : string;

    @prop({required : true})
    public totalWinners! : number;

    @prop({required : true})
    public totalPayout! : number;

    @prop({required : true})
    public watchVideo! : string;

    @prop({default : 'none'})
    public multiplierInfo : 'heads' | 'tails' | 'ct' | 'none'

    @prop({default : false})
    public sameSlotAndSpinResult : boolean;
}

export const SpinModel = getModelForClass(Spin)