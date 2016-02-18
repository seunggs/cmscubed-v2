import React from 'react'
import R from 'ramda'
import {browserHistory} from 'react-router'
import C3Input from '../../../shared/C3Input'
import C3Select from '../../../shared/C3Select'
import C3Option from '../../../shared/C3Option'
import C3SubmitButton from '../../../shared/C3SubmitButton'
import C3HiddenInput from '../../../shared/C3HiddenInput'
import {checkIsNotEmpty, checkIsCamelCased, checkIsDomain, projectDomainIsAvailable$$} from '../../../../modules/validators/'
import {createStateIds} from '../../../../modules/core/state'
import {addNewProjectAndAddProjectToUser$$} from '../../../../modules/observables/ui'
import {getUserProject$$} from '../../../../modules/observables/auth'

const Setup = React.createClass({
  // componentWillMount() {
  //   // before mounting, check to make sure they haven't already done the setup
  //   getUserProject$$(localStorage.getItem('userEmail'))
  //     .subscribe(projects => {
  //       if (!R.isNil(projects)) {
  //         browserHistory.replace('/dashboard')
  //       }
  //     }, err => {
  //       console.log('Something went wrong while running addUserProfile$ and checkSetupIsComplete$: ', err)
  //     })
  // },
  render() {
    const {location, rootState} = this.props
    const ids = createStateIds(5, location.pathname)
    const userEmail = localStorage.getItem('userEmail')
    console.log('userEmail: ', userEmail)

    const isRequiredValidator = {attrName: 'is-required', predicateFunc: checkIsNotEmpty, errorMsg: 'This field is required'}
    const isCamelCasedValidator = {attrName: 'is-camelcased', predicateFunc: checkIsCamelCased, errorMsg: 'Project name must be camel cased'}
    const isDomainValidator = {attrName: 'is-domain', predicateFunc: checkIsDomain, errorMsg: 'Invalid domain'}
    const isAvailableValidator = {attrName: 'is-available', predicateFunc: projectDomainIsAvailable$$, errorMsg: 'This domain is unavailable'}

    return (
      <div id="setup" className="clearfix mxn2">
        <div className="col-6 px2 mx-auto">
          <div className="p3">
            <h2 className="mb3">Project Setup</h2>
            <form noValidate>
              <C3HiddenInput name="email" value={userEmail} />
              <C3Input id={ids[0]} name="project" rootState={rootState} labelText="Project Name" validators={[isRequiredValidator, isCamelCasedValidator]} autoFocus="true" />
              <C3Input id={ids[1]} name="prodDomain" rootState={rootState} labelText="Project Production Domain" validators={[isRequiredValidator, isDomainValidator]} asyncValidator={isAvailableValidator} />
              <C3Input id={ids[2]} name="stagingDomain" rootState={rootState} labelText="Project Staging Domain" validators={[isRequiredValidator, isDomainValidator]} />
              <C3Select id={ids[3]} name="locale" rootState={rootState} placeholder="Default Locale" validators={[isRequiredValidator]} selected={'en-US'}>
                <C3Option value="en-US"></C3Option>
              </C3Select>
              <C3SubmitButton id={ids[4]} ref="blah" rootState={rootState} nextRoute={'/loggedin'} createSubmitForm$={addNewProjectAndAddProjectToUser$$}>Next &rarr;</C3SubmitButton>
            </form>
          </div>
        </div>
      </div>
    )
  }
})

export default Setup
