import { atom } from 'jotai';



export const selectedTaskAtom = atom<any>(null);

/* Sample object of a test
{
    "id": 8,
    "display_id": "T-0001-0001",
    "group_id": 3,
    "method_id": 1,
    "users": [
      {
        "id": 9,
        "username": "fk7is3nl_tester1"
      }
    ],
    "method": {
      "id": 1,
      "name": "Method A",
      "devices": [
        {
          "id": 1,
          "name": "Device A",
          "device_type": {
            "id": 1,
            "name": "Electrical Device",
            "description": "Device for electrical testing",
            "created_at": "2025-06-01T04:42:03.133313",
            "updated_at": "2025-06-01T04:42:03.133313"
          },
          "status": "Available",
          "position": null,
          "previous_maintenance_date": null,
          "next_maintenance_date": null,
          "description": "Device for electrical testing",
          "created_at": "2025-06-01T04:42:03.138130",
          "updated_at": "2025-06-01T04:42:03.138130"
        }
      ],
      "skills": [
        {
          "id": 1,
          "name": "Electrical Testing",
          "description": "Testing electrical systems"
        }
      ],
      "description": "Method for electrical testing",
      "created_at": "2025-06-01T04:42:03.149492",
      "updated_at": "2025-06-01T04:42:03.149492"
    },
    "test_reports": [
      {
        "id": 4
      }
    ],
    "name": "Test 1 for Group fk7is3nl 1",
    "status": "Completed",
    "description": "Test 1 for Group fk7is3nl 1",
    "created_at": "2025-05-20T09:42:10.074549",
    "updated_at": "2025-05-20T09:42:10.074549"
  },
  */
export interface DeviceType {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Device {
    id: number;
    name: string;
    device_type: DeviceType;
    status: string;
    position: string | null;
    previous_maintenance_date: string | null;
    next_maintenance_date: string | null;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Skill {
    id: number;
    name: string;
    description: string;
}

export interface Method {
    id: number;
    name: string;
    devices: Device[];
    skills: Skill[];
    description: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
}

export interface TestReport {
    id: number;
}

export interface Test {
    id: number;
    display_id: string;
    group_id: number;
    method_id: number;
    users: User[];
    method: Method;
    test_reports: TestReport[];
    name: string;
    status: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export const myTestsAtom = atom<Test[]>([]);
