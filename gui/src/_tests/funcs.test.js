import React from "react"

import renderer from "react-test-renderer";
import {API_ENDPOINT} from "../_constants/index"
import {getAPIEndpoint, isAdminOfAParentGroup, getUserRoleInGroup, getMaxUserRole, getFirstCoordinate} from "../_tools/funcs";

describe("Test", () => {
    test("test runs", () => {
        expect(true).toEqual(true)
    });
});

describe("getAPIEndpoint", () => {
    const res = getAPIEndpoint()

    test("returns correct endpoint", () => {
        //because I'm using a local standup to test, this test differs locally from on dev.
        if (window && window.location && window.location.port === '3000') {
            expect(res).toEqual(`https://dev2.radiam.ca/api`)
        }
        else{
            expect(res).toEqual(
                `/${API_ENDPOINT}`
            )
        }
    }) 
})


//TODO: these functions would require a live server to test on, and need mocks generated instead prior to being elaborated on

describe("isAdminOfParentGroup", () => {
    test("rejects when called without group id", () => {
        expect(isAdminOfAParentGroup()).rejects.toEqual("No Group ID")
    })
    
    /*cannot run this without a valid user cookie
    test("rejects with no user cookie", () => {
        expect(isAdminOfAParentGroup("NO_COOKIE")).rejects.toEqual("No User Cookie")
    })
    test("rejects when called with invalid group id", () => {
        expect(isAdminOfAParentGroup("INVALID_GROUP_ID")).rejects.toEqual("Invalid Key")
    })*/
})

//given a group ID, determine the current user's status in said group
describe ("getUserRoleInGroup(group)", () => {

    test("returns `user` when called without group id (or cookie)", () => {
        expect(getUserRoleInGroup()).toEqual("anonymous")
    })
})

describe("getRecentProjects()", () => {
    //test for an invalid set of projects when called with no user
})

describe("getmaxuserrole", () => {
    test("returns `anonymous` when called without cookie", () => {
        expect(getMaxUserRole()).toEqual("anonymous")
    })
})

describe("getFirstCoordinate", () => {
    const dummyPoint = {feature: {
        geometry: {
            type: "Point",
            coordinates: [0, 0]
        }
    }}
    const dummyLineString = {feature: {
        geometry: {
            type: "LineString",
            coordinates: [[2, 2],[0, 0],[1, 1]]
        }
    }}
    const dummyPolygon = {feature: {
        geometry: {
            type: "Polygon",
            coordinates: [[[3, 3], [2, 2], [1, 1], [0, 0]]]
        }
    }}
    //TODO: dummy multi___ types
    test("returns coordinate of Point object", () => {
        expect(getFirstCoordinate(dummyPoint)).toEqual(dummyPoint.feature.geometry.coordinates)
    })
    test("returns first coordinate of LineString object", () => {
        expect(getFirstCoordinate(dummyLineString)).toEqual(dummyLineString.feature.geometry.coordinates[0])
    })
    test("returns first coordinate of Polygon object", () => {
        expect(getFirstCoordinate(dummyPolygon)).toEqual(dummyPolygon.feature.geometry.coordinates[0][0])
    })
})