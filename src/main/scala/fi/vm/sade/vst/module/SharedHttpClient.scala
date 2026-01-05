package fi.vm.sade.vst.module

import org.asynchttpclient.{AsyncHttpClient, DefaultAsyncHttpClientConfig}
import org.asynchttpclient.Dsl.asyncHttpClient

import java.time.Duration

object SharedHttpClient {
  private val httpConfig = new DefaultAsyncHttpClientConfig.Builder()
    .setMaxConnections(100)
    .setMaxConnectionsPerHost(20)
    .setRequestTimeout(Duration.ofSeconds(60))
  val instance: AsyncHttpClient = asyncHttpClient(httpConfig)
}
