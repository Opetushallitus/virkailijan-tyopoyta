
name := "Virkailijan Työpöytä"
version := "1.0.0"
organization := "fi.vm.sade"

scalaVersion := "2.11.8"

scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")

mainClass in (Compile, run) := Some("fi.vm.sade.vst.Main")

resourceDirectory in (Compile, run) := baseDirectory.value / "resources"

val AkkaHttpVersion   = "10.0.0"

resolvers += "oph-sade-artifactory-snapshots" at "https://artifactory.oph.ware.fi/artifactory/oph-sade-snapshot-local"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http" % AkkaHttpVersion,
  "com.typesafe" % "config" % "1.3.1",
  "com.typesafe.play" %% "play-json" % "2.6.0-M1",
  "com.softwaremill.akka-http-session" %% "core" % "0.3.0",
  "fi.vm.sade" %% "scala-ldap-client" % "1.0.0-SNAPSHOT",
  "fi.vm.sade" %% "scala-cas" % "0.4.0-SNAPSHOT",
  "com.softwaremill.macwire" %% "macros" % "2.2.5" % "provided",
  "com.github.cb372" %% "scalacache-guava" % "0.9.3",
  "org.json4s" %% "json4s-native" % "3.5.0"
)


