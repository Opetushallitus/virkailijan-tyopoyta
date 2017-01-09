
name := "Virkailijan Työpöytä"
version := "1.0.0"
organization := "fi.vm.sade"

scalaVersion := "2.11.8"

scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")

mainClass in (Compile, run) := Some("fi.vm.sade.vst.Server")

resourceDirectory in (Compile, run) := baseDirectory.value / "resources"

val AkkaHttpVersion   = "10.0.0"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-http" % AkkaHttpVersion,
  "com.typesafe" % "config" % "1.3.1",
  "com.typesafe.play" %% "play-json" % "2.6.0-M1"

)
