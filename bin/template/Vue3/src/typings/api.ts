
export interface ID {
  id: number
}


export interface UserInfo {
  nick_name: string
  account: string
  mobile: string
  avatar: string
  id: string
}

export interface Policy {
  accessid: string,
  policy: string,
  signature: string,
  host: string,
  expire: string,
  dir: string
}

export interface Task {
  id: string
  task: string
  isSelected: boolean
  status: number
}

