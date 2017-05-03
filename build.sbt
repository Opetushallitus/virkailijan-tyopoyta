
name := "Virkailijan Työpöytä"
version := "1.0.0"
organization := "fi.vm.sade"

scalaVersion := "2.11.8"

scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")

mainClass in (Compile, run) := Some("fi.vm.sade.vst.Main")

resourceDirectory in (Compile, run) := baseDirectory.value / "resources"

parallelExecution in Test := false

val AkkaHttpVersion   = "10.0.0"

resolvers += "oph-sade-artifactory-snapshots" at "https://artifactory.oph.ware.fi/artifactory/oph-sade-snapshot-local"

// Typesafe, akka-http, macwire dependencies
libraryDependencies ++= Seq(
  "com.softwaremill.akka-http-session" %% "core" % "0.3.0",
  "com.softwaremill.macwire" %% "macros" % "2.2.5" % "provided",
  "com.typesafe" % "config" % "1.3.1",
  "com.typesafe.akka" %% "akka-http" % AkkaHttpVersion,
  "com.typesafe.play" %% "play-json" % "2.6.0-M1",
  "org.json4s" %% "json4s-native" % "3.5.0",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.5.0"
)

// OPH dependencies
libraryDependencies ++= Seq(
  "fi.vm.sade" %% "scala-cas" % "0.4.0-SNAPSHOT",
  "fi.vm.sade" %% "scala-group-emailer" % "0.3.0-SNAPSHOT",
  "fi.vm.sade" %% "scala-ldap-client" % "1.0.0-SNAPSHOT",
  "fi.vm.sade" % "auditlogger" % "7.0.0-SNAPSHOT",
  "fi.vm.sade" %% "scala-properties" % "0.0.1-SNAPSHOT"
)

// Extra util dependencies
libraryDependencies ++= Seq(
  "com.github.cb372" %% "scalacache-guava" % "0.9.3",
  "org.json4s" %% "json4s-native" % "3.5.0",
  "org.jsoup" % "jsoup" % "1.10.2",
  "ch.qos.logback" % "logback-classic" % "1.2.3",
  "io.swagger" % "swagger-jaxrs" % "1.5.13",
  "com.github.swagger-akka-http" %% "swagger-akka-http" % "0.9.1"
)

// DB dependencies
libraryDependencies ++= Seq(
  "com.h2database" % "h2" % "1.4.193",
  "io.underscore" %% "slickless" % "0.3.0",
  "org.flywaydb" % "flyway-core" % "4.0.3",
  "org.postgresql" % "postgresql" % "9.4.1212",
  "org.scalikejdbc" %% "scalikejdbc" % "2.5.0",
  "org.scalikejdbc" %% "scalikejdbc-config" % "2.5.0",
  "org.scalikejdbc" %% "scalikejdbc-jsr310" % "2.5.0",
  "org.scalikejdbc" %% "scalikejdbc-syntax-support-macro" % "2.5.0"
)

// Akka-quartz-scheduler for Scheduling / Cron jobs
libraryDependencies ++= Seq(
  "com.enragedginger" %% "akka-quartz-scheduler" % "1.4.0-akka-2.3.x"
)

// Test libraries
libraryDependencies ++= Seq(
  "junit" % "junit" % "4.11" % "test",
  "org.specs2" %% "specs2-core" % "3.8.9" % "test",
  "org.specs2" %% "specs2-junit" % "3.8.9" % "test"
)
