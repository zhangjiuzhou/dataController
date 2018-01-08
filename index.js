'use strict'
/**
 * Created by jiuzhou.zhang on 2017/11/9.
 */

import BaseDataController from './BaseDataController'
import DataComponent from './DataComponent'
import FlatListDataComponent from './FlatListDataComponent'

const DataController = BaseDataController(DataComponent)
const FlatListDataController = BaseDataController(FlatListDataComponent)
DataController.modes = DataComponent.modes
FlatListDataController.modes = DataComponent.modes

export {
  BaseDataController,
  DataController,
  FlatListDataController
}
