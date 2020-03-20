import React from "react"

import renderer from "react-test-renderer";
import {API_ENDPOINT} from "../_constants/index"
import {getAPIEndpoint, isAdminOfAParentGroup, getUserRoleInGroup, getMaxUserRole, getFirstCoordinate} from "../_tools/funcs";
import {dummyPoint, dummyPolygon, dummyMultiLineString, dummyLineString, dummyMultiPoint, dummyMultiPolygon} from "./mocks/models"

describe("Test", () => {
    test("test runs", () => {
        expect(true).toEqual(true)
    });
});

describe("getAPIEndpoint", () => {
    const res = getAPIEndpoint()

    test("returns correct endpoint", () => {
        expect(res).toEqual(`/${API_ENDPOINT}`)
    }) 
})


//TODO: these functions would require a live server to test on, and need mocks generated instead prior to being elaborated on

describe("isAdminOfParentGroup", () => {

    test("User not authenticated", () => {
        expect(isAdminOfAParentGroup()).rejects.toEqual("User Not Authenticated")
    })

    /* Cannot run these without a valid user cookie

    test("rejects when called without group id", () => {
        expect(isAdminOfAParentGroup()).rejects.toEqual("No Group ID")
    })
    
    test("rejects with no user cookie", () => {
        expect(isAdminOfAParentGroup("NO_COOKIE")).rejects.toEqual("No User Cookie")
    })
    test("rejects when called with invalid group id", () => {
        expect(isAdminOfAParentGroup("INVALID_GROUP_ID")).rejects.toEqual("Invalid Key")
    })*/
})

//given a group ID, determine the current user's status in said group
describe ("getUserRoleInGroup(group)", () => {

    /* this function got changed or removed - need a new test for it
    test("returns `user` when called without group id (or cookie)", () => {
        expect(getUserRoleInGroup()).toEqual("anonymous")
    })
    */
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
    /* 
     * getfirstcoordinates returns a reversed list of the coordinates - this is required 
     * for leaflet to display in [lng, lat]
     */
    test("returns coordinate of Point object", () => {
        expect(getFirstCoordinate(dummyPoint)).toEqual(dummyPoint.feature.geometry.coordinates.reverse())
    })
    test("returns first coordinate of LineString object", () => {
        expect(getFirstCoordinate(dummyLineString)).toEqual(dummyLineString.feature.geometry.coordinates[0].reverse())
    })
    test("returns first coordinate of Polygon object", () => {
        expect(getFirstCoordinate(dummyPolygon)).toEqual(dummyPolygon.feature.geometry.coordinates[0][0].reverse())
    })

    test("returns first coordinate of MultiPoint object", () => {
        expect(getFirstCoordinate(dummyMultiPoint)).toEqual(dummyMultiPoint.feature.geometry.coordinates[0].reverse())
    })

    test("returns first coordinate of MultiLineString object", () => {
        expect(getFirstCoordinate(dummyMultiLineString)).toEqual(dummyMultiLineString.feature.geometry.coordinates[0][0].reverse())
    }) 

    test("returns first coordinate of MultiPolygon object", () => {
        expect(getFirstCoordinate(dummyMultiPolygon)).toEqual(dummyMultiPolygon.feature.geometry.coordinates[0][0][0].reverse())
    })
    test("returns false if sent no object", () => {
        expect(getFirstCoordinate()).toEqual(false)
    })
    test("returns false if sent an invalid object", () => {
        expect(getFirstCoordinate({})).toEqual(false)
    })
    test("returns false if sent a layer with no type or coords", () => {
        expect(getFirstCoordinate({feature: {}})).toEqual(false)
    })
    test("returns false if sent a layer with geometry but no type", () => {
        expect(getFirstCoordinate({feature: {geometry: [5, 5]}})).toEqual(false)
    })
    test("returns false if sent a layer with type but no geometry", () => {
        expect(getFirstCoordinate({feature: {type: "unknown"}})).toEqual(false)
    })
    test("returns false if sent an unknown object", () => {
        expect(getFirstCoordinate({feature: {type: "unknown", geometry: [1, 1]}})).toEqual(false)
    })
    test("returns false if sent an invalid coordinates with type LineString", () => {
        let badPoint = dummyPoint
        badPoint.feature.geometry.type="LineString"
        expect(getFirstCoordinate(badPoint)).toEqual(false)
    })
})