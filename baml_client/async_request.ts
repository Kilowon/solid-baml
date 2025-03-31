/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
/* eslint-disable */
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
import type { BamlRuntime, BamlCtxManager, ClientRegistry, Image, Audio } from "@boundaryml/baml"
import { toBamlError, HTTPRequest } from "@boundaryml/baml"
import type { Checked, Check } from "./types"
import type * as types from "./types"
import type {Resume} from "./types"
import type TypeBuilder from "./type_builder"

type BamlCallOptions = {
  tb?: TypeBuilder
  clientRegistry?: ClientRegistry
}

export class AsyncHttpRequest {
  constructor(private runtime: BamlRuntime, private ctxManager: BamlCtxManager) {}

  
  async ExtractResume(
      resume: string,
      __baml_options__?: BamlCallOptions
  ): Promise<HTTPRequest> {
    try {
      return await this.runtime.buildRequest(
        "ExtractResume",
        {
          "resume": resume
        },
        this.ctxManager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
        false,
      )
    } catch (error) {
      throw toBamlError(error);
    }
  }
  
}

export class AsyncHttpStreamRequest {
  constructor(private runtime: BamlRuntime, private ctxManager: BamlCtxManager) {}

  
  async ExtractResume(
      resume: string,
      __baml_options__?: BamlCallOptions
  ): Promise<HTTPRequest> {
    try {
      return await this.runtime.buildRequest(
        "ExtractResume",
        {
          "resume": resume
        },
        this.ctxManager.cloneContext(),
        __baml_options__?.tb?.__tb(),
        __baml_options__?.clientRegistry,
        true,
      )
    } catch (error) {
      throw toBamlError(error);
    }
  }
  
}