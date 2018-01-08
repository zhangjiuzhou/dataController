'use strict'
/**
 * Created by jiuzhou.zhang on 2017/11/1.
 */

import React, { PropTypes } from 'react'
import {InteractionManager} from 'react-native'
import sceneContext from '../Scene/sceneContext'

@sceneContext
export default function (InnerComponent) {
  return class extends React.Component {
    static propTypes = {
      dataComponentRef: PropTypes.func,
      autoLoad: PropTypes.bool,
      autoRefresh: PropTypes.bool,
      onLoadData: PropTypes.func,
      onLoadError: PropTypes.func
    }

    static defaultProps = {
      autoLoad: true
    }

    _flag = false
    _wrappedInstance

    load (mode = null) {
      if (this._wrappedInstance) {
        this._wrappedInstance.load(mode)
      }
    }

    componentDidMount () {
      let instance = this.refs.wrappedInstance
      while (instance.refs.wrappedInstance || instance.wrappedInstance) {
        if (instance.refs.wrappedInstance) {
          instance = instance.refs.wrappedInstance
        } else {
          instance = instance.wrappedInstance
        }
      }
      this._wrappedInstance = instance

      if (this.props.autoLoad) {
        this.load()
      }

      if (this.props.dataComponentRef) {
        this.props.dataComponentRef(this)
      }
    }

    onEnterScene () {
      if (this._flag && this.props.autoRefresh) {
        this.load()
      }
      this._flag = true
    }

    render () {
      return <InnerComponent
        ref='wrappedInstance'
        {...this.props}
        loadData={(complete, mode) => {
          const { promise, cancel } = this.props.loadData(mode)
          promise.then(data => {
            InteractionManager.runAfterInteractions(() => {
              if (this.props.onLoadData) {
                this.props.onLoadData(data, mode)
              }
              complete()
            })
          }).catch(e => {
            if (e.type) {
              InteractionManager.runAfterInteractions(() => {
                if (this.props.onLoadError) {
                  this.props.onLoadError(e, mode)
                }
                complete()
              })
            } else {
              setImmediate(() => {
                throw e
              })
            }
          })
          return cancel
        }}
      />
    }
  }
}
