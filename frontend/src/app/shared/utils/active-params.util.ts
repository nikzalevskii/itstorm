import {Params} from "@angular/router";
import {ActiveParamsInterface} from "../../../interfaces/active-params.interface";

export class ActiveParamsUtil {
  static processParams(params:Params):ActiveParamsInterface {
    const activeParams:ActiveParamsInterface = {categories:[]};
    if (params.hasOwnProperty('categories')) {
      activeParams.categories = params['categories'];
    }
    if (params.hasOwnProperty('page')) {
      activeParams.page = +params['page'];
    }
    return activeParams;
  }

}
