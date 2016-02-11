import React from 'react'
import C3Input from '../../../shared/C3Input'
import C3Select from '../../../shared/C3Select'
import C3Option from '../../../shared/C3Option'
import C3SubmitButton from '../../../shared/C3SubmitButton'
import {checkIsNotEmpty, checkIsCamelCased, checkIsDomain, createProjectNameIsAvailable$} from '../../../../modules/validators/'
import {createStateIds, getElemState} from '../../../../modules/core/state'

const Setup = ({rootState = {}, location}) => {
  const isRequiredValidator = {attrName: 'is-required', predicateFunc: checkIsNotEmpty, errorMsg: 'This field is required'}
  const isCamelCasedValidator = {attrName: 'is-camelcased', predicateFunc: checkIsCamelCased, errorMsg: 'Project name must be camel cased'}
  const isDomainValidator = {attrName: 'is-domain', predicateFunc: checkIsDomain, errorMsg: 'Invalid domain'}
  const isAvailableValidator = {attrName: 'is-available', predicateFunc: createProjectNameIsAvailable$, errorMsg: 'This project name is unavailable'}
  const ids = createStateIds(4, location.pathname)
  const elemStates = ids.map(id => getElemState(id, rootState))
  const processForm = () => {
    console.log('Form ran: ', location.pathname)
  }

  return (
    <div className="clearfix mxn2">
      <div className="col-6 px2 mx-auto">
        <div className="p3">
          <h2 className="mb3">Project Setup</h2>
          <form noValidate>
            <C3Input id={ids[0]} name="projectName" elemState={elemStates[0]} labelText="Project Name" validators={[isRequiredValidator, isCamelCasedValidator]} asyncValidator={isAvailableValidator} autoFocus="true" />
            <C3Input id={ids[1]} name="projectDomain" elemState={elemStates[1]} labelText="Project Domain" validators={[isRequiredValidator, isDomainValidator]} />
            <C3Select id={ids[2]} name="projectLocale" elemState={elemStates[2]} placeholder="Default Locale" validators={[isRequiredValidator]}>
              <C3Option value="en-US"></C3Option>
            </C3Select>
            <C3SubmitButton id={ids[3]} elemState={elemStates[3]} run={processForm}>Next &rarr;</C3SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Setup
