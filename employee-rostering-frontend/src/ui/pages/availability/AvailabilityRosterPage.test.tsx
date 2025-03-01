/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as React from 'react';
import Spot from 'domain/Spot';
import Employee from 'domain/Employee';
import Shift from 'domain/Shift';
import  { AvailabilityRosterPage, Props, ShiftOrAvailability, isShift, isAvailability,
  isAllDayAvailability, isDay } from './AvailabilityRosterPage';
import RosterState from 'domain/RosterState';
import moment from 'moment-timezone';
import "moment/locale/en-ca";
import EmployeeAvailability from 'domain/EmployeeAvailability';
import { useTranslation } from 'react-i18next';
import Actions from 'ui/components/Actions';

describe('Availability Roster Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when loaded', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    expect(toJson(availabilityRosterPage)).toMatchSnapshot();
  });

  it('should render correctly when loading', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
      isLoading
      allEmployeeList={[]}
      shownEmployeeList={[]}
      employeeIdToAvailabilityListMap={new Map()}
      employeeIdToShiftListMap={new Map()}
    />);
    expect(toJson(availabilityRosterPage)).toMatchSnapshot();
  });

  it('should render correctly when there are no employees', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
      allEmployeeList={[]}
      shownEmployeeList={[]}
      employeeIdToAvailabilityListMap={new Map()}
      employeeIdToShiftListMap={new Map()}
    />);
    expect(toJson(availabilityRosterPage)).toMatchSnapshot();
  });

  it('should render correctly when solving', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
      isSolving
    />);
    expect(toJson(availabilityRosterPage)).toMatchSnapshot();
  });

  it('should render correctly when creating a new availability via button', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.find(Actions).prop('actions')
      .filter(a => a.name === "Trans(i18nKey=createAvailability)")
      .forEach(a => a.action());
    expect(toJson(availabilityRosterPage)).toMatchSnapshot();
  });

  it('should call getAvailabilityRosterFor on onDateChange', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    const newDateStart = moment(startDate).add(7, "days").toDate();
    const newDateEnd = moment(endDate).add(7, "days").toDate();
    availabilityRosterPage.onDateChange(newDateStart, newDateEnd);
    expect(baseProps.getAvailabilityRosterFor).toBeCalled();
    expect(baseProps.getAvailabilityRosterFor).toBeCalledWith({
      fromDate: newDateStart,
      toDate: newDateEnd,
      employeeList: baseProps.shownEmployeeList
    });
  });

  it('should call getAvailabilityRosterFor on employee change', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    const newEmployee: Employee = {
      ...employee,
      id: 111,
      name: "New Employee"
    };

    availabilityRosterPage.onUpdateEmployeeList(newEmployee);
    expect(baseProps.getAvailabilityRosterFor).toBeCalled();
    expect(baseProps.getAvailabilityRosterFor).toBeCalledWith({
      fromDate: baseProps.startDate,
      toDate: baseProps.endDate,
      employeeList: [newEmployee]
    });
  });

  it('should not call getAvailabilityRosterFor on employee change if invalid', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    availabilityRosterPage.onUpdateEmployeeList(undefined);
    expect(baseProps.getAvailabilityRosterFor).not.toBeCalled();
  });

  it('should change the week when the user change the week', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    const newDateStart = moment(startDate).add(7, "days").toDate();
    const newDateEnd = moment(endDate).add(7, "days").toDate();
    availabilityRosterPage.find('WeekPicker[aria-label="Select Week to View"]')
      .simulate("change", newDateStart, newDateEnd);
    expect(baseProps.getAvailabilityRosterFor).toBeCalled();
    expect(baseProps.getAvailabilityRosterFor).toBeCalledWith({
      fromDate: newDateStart,
      toDate: newDateEnd,
      employeeList: baseProps.shownEmployeeList
    });
  });

  it('should change the employee when the user change the employee', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    const newEmployee: Employee = {
      ...employee,
      id: 111,
      name: "New Employee"
    };
    availabilityRosterPage.find('TypeaheadSelectInput[aria-label="Select Employee"]').simulate("change", newEmployee);
    expect(baseProps.getAvailabilityRosterFor).toBeCalled();
    expect(baseProps.getAvailabilityRosterFor).toBeCalledWith({
      fromDate: baseProps.startDate,
      toDate: baseProps.endDate,
      employeeList: [newEmployee]
    });
  });

  it('should go to the Employees page if the user click on the link', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
      allEmployeeList={[]}
      shownEmployeeList={[]}
      employeeIdToAvailabilityListMap={new Map()}
      employeeIdToShiftListMap={new Map()}
    />);
    shallow((availabilityRosterPage.find('Trans').prop('components') as any)[2]).simulate("click");
    expect(baseProps.history.push).toBeCalled();
    expect(baseProps.history.push).toBeCalledWith("/employees");
  });

  it('should call publishRoster when the publish button is clicked', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.find(Actions).prop('actions')
      .filter(a => a.name === "Trans(i18nKey=publish)")
      .forEach(a => a.action());
    expect(baseProps.publishRoster).toBeCalled();
  });

  it('should call solveRoster when the schedule button is clicked', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.find(Actions).prop('actions')
      .filter(a => a.name === "Trans(i18nKey=schedule)")
      .forEach(a => a.action());
    expect(baseProps.solveRoster).toBeCalled();
  });

  it('should call terminateSolvingRosterEarly when the Terminate Early button is clicked', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
      isSolving
    />);
    availabilityRosterPage.find(Actions).prop('actions')
      .filter(a => a.name === "Trans(i18nKey=terminateEarly)")
      .forEach(a => a.action());
    expect(baseProps.terminateSolvingRosterEarly).toBeCalled();
  });

  it('should call refreshAvailabilityRoster and show an info message when the refresh button is clicked', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.find(Actions).prop('actions')
      .filter(a => a.name === "Trans(i18nKey=refresh)")
      .forEach(a => a.action());
    expect(baseProps.refreshAvailabilityRoster).toBeCalled();
    expect(baseProps.showInfoMessage).toBeCalled();
    expect(baseProps.showInfoMessage).toBeCalledWith("availabilityRosterRefresh");
  });

  it('call deleteShift when the EditShiftModal delete a shift', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.setState({
      selectedShift: shift,
      isCreatingOrEditingShift: true
    });
    availabilityRosterPage.find('[aria-label="Edit Shift"]').simulate("delete", shift);
    expect(baseProps.removeShift).toBeCalled();
    expect(baseProps.removeShift).toBeCalledWith(shift);
    expect(availabilityRosterPage.state("isCreatingOrEditingShift")).toEqual(false);
  });

  it('call addShift when the EditShiftModal add a new shift', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.setState({
      isCreatingOrEditingShift: true
    });
    const newShift: Shift = {
      ...shift,
      id: undefined,
      version: undefined,
      startDateTime: startDate,
      endDateTime: endDate
    };
    availabilityRosterPage.find('[aria-label="Edit Shift"]').simulate("save", newShift);
    expect(baseProps.addShift).toBeCalled();
    expect(baseProps.addShift).toBeCalledWith(newShift);
    expect(availabilityRosterPage.state("isCreatingOrEditingShift")).toEqual(false);
  });

  it('call updateShift when the EditShiftModal updates a shift', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.setState({
      selectedShift: shift,
      isCreatingOrEditingShift: true
    });
    const newShift: Shift = {
      ...shift,
      startDateTime: startDate,
      endDateTime: endDate
    };
    availabilityRosterPage.find('[aria-label="Edit Shift"]').simulate("save", newShift);
    expect(baseProps.updateShift).toBeCalled();
    expect(baseProps.updateShift).toBeCalledWith(newShift);
    expect(availabilityRosterPage.state("isCreatingOrEditingShift")).toEqual(false);
  });

  it('should set isEditingOrCreatingShift to false when closed', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    availabilityRosterPage.setState({
      isCreatingOrEditingShift: true
    });
    availabilityRosterPage.find('[aria-label="Edit Shift"]').simulate("close");
    expect(availabilityRosterPage.state("isCreatingOrEditingShift")).toEqual(false);
  });

  it('should call addAvailability when a timeslot is selected', () => {
    const availabilityRosterPage = shallow(<AvailabilityRosterPage
      {...baseProps}
    />);
    const newDateStart = moment(startDate).add(7, "days").toDate();
    const newDateEnd = moment(endDate).add(7, "days").toDate();
    ((availabilityRosterPage.find('Schedule').props()) as { addEvent: Function}).addEvent(newDateStart,
      newDateEnd);

    expect(baseProps.addEmployeeAvailability).toBeCalled();
    expect(baseProps.addEmployeeAvailability).toBeCalledWith({
      tenantId: employee.tenantId,
      startDateTime: newDateStart,
      endDateTime: newDateEnd,
      employee: employee,
      state: "UNAVAILABLE"
    });
  });

  it('should have solid border if the shift is published', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    const startDateTime = moment(startDate).subtract("2", "day").toDate();
    const endDateTime = moment(startDate).subtract("1", "day").toDate();

    const publishedShift: ShiftOrAvailability = {
      type: "Shift",
      start: startDateTime,
      end: endDateTime,
      reference: {
        ...shift,
        startDateTime,
        endDateTime
      },
    };

    const style = availabilityRosterPage.getEventStyle(publishedShift);
    expect(style).toEqual({
      style: {
        border: "1px solid",
      }
    });
  });

  it('should keep the color and have a dashed border if the shift is draft', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);

    const draftShift: ShiftOrAvailability = {
      type: "Shift",
      start: shift.startDateTime,
      end: shift.endDateTime,
      reference: shift
    };

    const style = availabilityRosterPage.getEventStyle(draftShift);
    expect(style).toEqual({
      style: {
        border: "1px dashed"
      }
    });
  });

  it('should color desired availablities green', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);

    const draftAvailability: ShiftOrAvailability = {
      type: "Availability",
      start: availability.startDateTime,
      end: availability.endDateTime,
      reference: {
        ...availability,
        state: "DESIRED"
      }
    };

    const style = availabilityRosterPage.getEventStyle(draftAvailability);
    expect(style).toEqual({
      style: {
        backgroundColor: "green",
        border: "1px dashed"
      }
    });
  });

  it('should color undesired availablities yellow', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);

    const draftAvailability: ShiftOrAvailability = {
      type: "Availability",
      start: availability.startDateTime,
      end: availability.endDateTime,
      reference: {
        ...availability,
        state: "UNDESIRED"
      }
    };

    const style = availabilityRosterPage.getEventStyle(draftAvailability);
    expect(style).toEqual({
      style: {
        backgroundColor: "yellow",
        border: "1px dashed"
      }
    });
  });

  it('should color unavailable availablities red', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);

    const draftAvailability: ShiftOrAvailability = {
      type: "Availability",
      start: availability.startDateTime,
      end: availability.endDateTime,
      reference: {
        ...availability,
        state: "UNAVAILABLE"
      }
    };

    const style = availabilityRosterPage.getEventStyle(draftAvailability);
    expect(style).toEqual({
      style: {
        backgroundColor: "red",
        border: "1px dashed"
      }
    });
  });

  it('day should be white if it is draft and no availabilities falls on the day', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);

    const style = availabilityRosterPage.getDayStyle([availability])(endDate);
    expect(style).toEqual({
      className: "draft-day",
      style: {
        backgroundColor: "var(--pf-global--BackgroundColor--100)"
      }
    });
  });

  it('day should be gray if it is published and no availabilities falls on the day', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);

    const style = availabilityRosterPage.getDayStyle([availability])(moment(startDate).subtract(1, "day").toDate());
    expect(style).toEqual({
      className: "published-day",
      style: {
        backgroundColor: "var(--pf-global--BackgroundColor--300)"
      }
    });
  });

  it('day should be green if a desired availability falls on the day', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    const availabilityClone: EmployeeAvailability = {
      ...availability,
      state: "DESIRED"  
    }
    const date = availability.startDateTime;
    const style = availabilityRosterPage.getDayStyle([availabilityClone])(date);
    expect(style).toEqual({
      className: "desired draft-day",
      style: {
      }
    });
  });

  it('day should be yellow if a undesired availability falls on the day', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    const availabilityClone: EmployeeAvailability = {
      ...availability,
      state: "UNDESIRED"  
    }
    const date = availability.startDateTime;
    const style = availabilityRosterPage.getDayStyle([availabilityClone])(date);
    expect(style).toEqual({
      className: "undesired draft-day",
      style: {
      }
    });
  });

  it('day should be red if a unavailable availability falls on the day', () => {
    const availabilityRosterPage = new AvailabilityRosterPage(baseProps);
    const availabilityClone: EmployeeAvailability = {
      ...availability,
      state: "UNAVAILABLE"  
    }
    const date = availability.startDateTime;
    const style = availabilityRosterPage.getDayStyle([availabilityClone])(date);
    expect(style).toEqual({
      className: "unavailable draft-day",
      style: {
      }
    });
  });

  // isDay
  it('isShift should return true iff an object an shift', () => {
    expect(isShift(shift)).toEqual(true);
    expect(isShift(availability)).toEqual(false);
  });

  it('isAvailability should return true iff an object an availability', () => {
    expect(isAvailability(shift)).toEqual(false);
    expect(isAvailability(availability)).toEqual(true);
  });

  it('isAllDayAvailability should return true iff an availability is an all day availability', () => {
    expect(isAllDayAvailability(availability)).toEqual(true);
    expect(isAllDayAvailability({
      ...availability,
      endDateTime: moment(availability.endDateTime).add(2, 'days').toDate()
    })).toEqual(true);
    expect(isAllDayAvailability({
      ...availability,
      endDateTime: moment(availability.endDateTime).add(9, 'hours').toDate()
    })).toEqual(false);
    expect(isAllDayAvailability({
      ...availability,
      startDateTime: moment(availability.startDateTime).subtract(9, 'hours').toDate()
    })).toEqual(false);
    expect(isAllDayAvailability({
      ...availability,
      startDateTime: moment(availability.startDateTime).subtract(9, 'hours').toDate(),
      endDateTime: moment(availability.endDateTime).add(9, 'hours').toDate()
    })).toEqual(false);
  });

  it('isDay should return true iff both the start date time and the end date time time ' + 
    'components are exactly midnight', () => {
    expect(isDay(moment("2018-07-01T09:00").toDate(), moment("2018-07-02T00:00").toDate())).toEqual(false);
    expect(isDay(moment("2018-07-01T00:00").toDate(), moment("2018-07-02T09:00").toDate())).toEqual(false);
    expect(isDay(moment("2018-07-01T00:00").toDate(), moment("2018-07-02T00:00").toDate())).toEqual(true);
    expect(isDay(moment("2018-07-01T00:00").toDate(), moment("2018-07-04T00:00").toDate())).toEqual(true);
  });
});

const spot: Spot = {
  tenantId: 0,
  id: 2,
  version: 0,
  name: "Spot",
  requiredSkillSet: [
    {
      tenantId: 0,
      id: 3,
      version: 0,
      name: "Skill"
    }
  ]
}

const employee: Employee = {
  tenantId: 0,
  id: 4,
  version: 0,
  name: "Employee 1",
  contract: {
    tenantId: 0,
    id: 5,
    version: 0,
    name: "Basic Contract",
    maximumMinutesPerDay: 10,
    maximumMinutesPerWeek: 70,
    maximumMinutesPerMonth: 500,
    maximumMinutesPerYear: 6000
  },
  skillProficiencySet: [{
    tenantId: 0,
    id: 6,
    version: 0,
    name: "Not Required Skill"
  }]
}

const shift: Shift = {
  tenantId: 0,
  id: 1,
  version: 0, 
  startDateTime: moment("2018-07-01T09:00").toDate(),
  endDateTime: moment("2018-07-01T17:00").toDate(),
  spot: spot,
  employee: employee,
  rotationEmployee: {
    ...employee,
    id: 7,
    name: "Rotation Employee"
  },
  pinnedByUser: false,
  indictmentScore: { hardScore: 0, mediumScore: 0, softScore: 0 },
  requiredSkillViolationList: [],
  unavailableEmployeeViolationList: [],
  shiftEmployeeConflictList: [],
  desiredTimeslotForEmployeeRewardList: [],
  undesiredTimeslotForEmployeePenaltyList: [],
  rotationViolationPenaltyList: [],
  unassignedShiftPenaltyList: [],
  contractMinutesViolationPenaltyList: []
};

const availability: EmployeeAvailability = {
  tenantId: 0,
  id: 123,
  version: 0,
  startDateTime: moment("2018-07-01T00:00").toDate(),
  endDateTime: moment("2018-07-02T00:00").toDate(),
  employee: employee,
  state: "DESIRED"
}

const startDate = moment("2018-07-01T09:00").startOf('week').toDate();
const endDate = moment("2018-07-01T09:00").endOf('week').toDate()

const rosterState: RosterState = {
  tenant: {
    id: 0,
    version: 0,
    name: "Tenant"
  },
  publishNotice: 14,
  publishLength: 7,
  firstDraftDate: new Date("2018-07-01"),
  draftLength: 7,
  unplannedRotationOffset: 0,
  rotationLength: 7,
  lastHistoricDate: new Date("2018-07-01"),
  timeZone: "EST"
};

const baseProps: Props = {
  ...useTranslation("AvailabilityRosterPage"),
  tReady: true,
  isSolving: false,
  isLoading: false,
  startDate: startDate,
  endDate: endDate,
  totalNumOfSpots: 1,
  rosterState: rosterState,
  allEmployeeList: [employee],
  shownEmployeeList: [employee],
  employeeIdToShiftListMap: new Map([
    [4, [shift]]
  ]),
  employeeIdToAvailabilityListMap: new Map([
    [4, [availability]]
  ]),
  addEmployeeAvailability: jest.fn(),
  removeEmployeeAvailability: jest.fn(),
  updateEmployeeAvailability: jest.fn(),
  getAvailabilityRosterFor: jest.fn(),
  refreshAvailabilityRoster:jest.fn(),
  solveRoster: jest.fn(),
  publishRoster: jest.fn(),
  terminateSolvingRosterEarly: jest.fn(),
  showInfoMessage: jest.fn(),
  addShift: jest.fn(),
  updateShift: jest.fn(),
  removeShift: jest.fn(),
  // @ts-ignore
  history: {
    push: jest.fn()
  }
}