package fi.vm.sade.vst.util

import scala.annotation.tailrec

object IterableUtils {
  @tailrec
  private def loop[A, B](splitSize: Int, iterable: Iterable[A], accumulator: Vector[B], func: (Iterable[A]) => (Iterable[B])): Iterable[B] = {
    if (iterable.nonEmpty) {
      val (head, tail) = iterable.splitAt(splitSize)
      val newAccumulator = accumulator ++ func(head)
      loop(splitSize, tail, newAccumulator, func)
    } else {
      accumulator
    }
  }

  def mapToSplitted[A, B](splitSize: Int, iterable: Iterable[A], func: (Iterable[A]) => (Iterable[B])): Iterable[B] = {
    if (splitSize <= 0) func(iterable)
    else loop(splitSize, iterable, Vector.empty, func)
  }
}
