export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Territory {
  name: string;
  counties: string[];
  appointmentType: 'in-person' | 'virtual';
  eventTypeId: string;
  calLink: string;
  calNamespace: string;
}

export const TERRITORIES: Record<string, Territory> = {
  greenville: {
    name: 'Greenville',
    counties: ['Abbeville County, SC', 'Anderson County, SC', 'Buncombe County, NC', 'Greenwood County, SC', 'Greenville County, SC', 'Haywood County, NC', 'Henderson County, NC', 'Jackson County, NC', 'Laurens County, SC', 'Madison County, NC', 'Oconee County, SC', 'Pickens County, SC', 'Polk County, NC', 'Rutherford County, NC', 'Spartanburg County, SC', 'Transylvania County, NC', 'Yancey County, NC'],
    appointmentType: 'in-person',
    eventTypeId: '3523440',
    calLink: 'team/value-build-homes/greenville',
    calNamespace: 'greenville'
  },
  columbia: {
    name: 'Columbia',
    counties: ['Barnwell County, SC', 'Bamberg County, SC', 'Calhoun County, SC', 'Edgefield County, SC', 'Fairfield County, SC', 'Kershaw County, SC', 'Lee County, SC', 'Lexington County, SC', 'McCormick County, SC', 'Newberry County, SC', 'Richland County, SC', 'Saluda County, SC', 'Sumter County, SC', 'Aiken County, SC', 'Clarendon County, SC', 'Orangeburg County, SC'],
    appointmentType: 'virtual',
    eventTypeId: '3523433',
    calLink: 'team/value-build-homes/columbia',
    calNamespace: 'columbia'
  },
  greensboro: {
    name: 'Greensboro',
    counties: ['Davidson County, NC', 'Davie County, NC', 'Forsyth County, NC', 'Guilford County, NC', 'Randolph County, NC', 'Yadkin County, NC'],
    appointmentType: 'virtual',
    eventTypeId: '3523455',
    calLink: 'team/value-build-homes/greensboro',
    calNamespace: 'greensboro'
  },
  oxford: {
    name: 'Oxford',
    counties: ['Alamance County, NC', 'Caswell County, NC', 'Durham County, NC', 'Granville County, NC', 'Orange County, NC', 'Person County, NC', 'Vance County, NC'],
    appointmentType: 'in-person',
    eventTypeId: '3552473',
    calLink: 'team/value-build-homes/oxford',
    calNamespace: 'oxford'
  },
  monroe: {
    name: 'Monroe',
    counties: ['Cherokee County, SC', 'Chester County, SC', 'Chesterfield County, SC', 'Cleveland County, NC', 'Gaston County, NC', 'Lancaster County, SC', 'Union County, NC', 'Union County, SC', 'York County, SC'],
    appointmentType: 'virtual',
    eventTypeId: '3825483',
    calLink: 'team/value-build-homes/monroe',
    calNamespace: 'monroe'
  },
  smithfield: {
    name: 'Smithfield',
    counties: ['Carteret County, NC', 'Craven County, NC', 'Edgecombe County, NC', 'Franklin County, NC', 'Greene County, NC', 'Halifax County, NC', 'Johnston County, NC', 'Jones County, NC', 'Lenoir County, NC', 'Nash County, NC', 'Pitt County, NC', 'Sampson County, NC', 'Warren County, NC', 'Wayne County, NC', 'Wilson County, NC', 'Duplin County, NC'],
    appointmentType: 'in-person',
    eventTypeId: '3523407',
    calLink: 'team/value-build-homes/smithfield',
    calNamespace: 'smithfield'
  },
  sanford: {
    name: 'Sanford',
    counties: ['Anson County, NC', 'Chatham County, NC', 'Cumberland County, NC', 'Harnett County, NC', 'Hoke County, NC', 'Lee County, NC', 'Montgomery County, NC', 'Moore County, NC', 'Richmond County, NC', 'Robeson County, NC', 'Scotland County, NC', 'Bladen County, NC', 'Wake County, NC'],
    appointmentType: 'in-person',
    eventTypeId: '3523167',
    calLink: 'team/value-build-homes/sanford',
    calNamespace: 'sanford'
  },
  statesville: {
    name: 'Statesville',
    counties: ['Alexander County, NC', 'Burke County, NC', 'Cabarrus County, NC', 'Caldwell County, NC', 'Catawba County, NC', 'Iredell County, NC', 'Lincoln County, NC', 'McDowell County, NC', 'Rowan County, NC', 'Stanly County, NC', 'Wilkes County, NC', 'Mecklenburg County, NC'],
    appointmentType: 'in-person',
    eventTypeId: '3523378',
    calLink: 'team/value-build-homes/statesville',
    calNamespace: 'statesville'
  },
  wilmington: {
    name: 'Wilmington',
    counties: ['Brunswick County, NC', 'Columbus County, NC', 'New Hanover County, NC', 'Pender County, NC', 'Onslow County, NC', 'Horry County, SC', 'Dillon County, SC'],
    appointmentType: 'virtual',
    eventTypeId: '3523418',
    calLink: 'team/value-build-homes/wilmington',
    calNamespace: 'wilmington'
  }
};
