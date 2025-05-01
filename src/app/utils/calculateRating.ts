// Function to calculate the Bayesian Average
export function calculateBayesianAverage(
  ratings: number[],
  globalAverage: number = 3.5,
  minThreshold: number = 10
): number {
  const totalRatings = ratings.length
  const sumOfRatings = ratings.reduce(
    (sum: number, rating: number) => sum + rating,
    0
  )

  return (
    (globalAverage * minThreshold + sumOfRatings) /
    (minThreshold + totalRatings)
  )
}

// Function to calculate the Exponential Time Decay Rating
export function calculateExponentialTimeDecay(
  ratings: number[],
  times: number[],
  decayConstant: number = 0.01
): number {
  let numerator = 0
  let denominator = 0

  ratings.forEach((rating: number, index: number) => {
    const time = times[index] // Time since the rating was given
    const weight = Math.exp(-decayConstant * time) // Calculate weight using exponential decay

    numerator += rating * weight // Weighted rating
    denominator += weight // Sum of weights
  })

  return numerator / denominator
}

// Function to calculate the Final Rating by averaging Bayesian and Time Decay Ratings
export function calculateFinalRating(
  ratings: number[],
  times: number[],
  globalAverage: number = 3.5,
  minThreshold: number = 1,
  decayConstant: number = 0.01
): number {
  // Calculate Bayesian Average
  const bayesianRating = calculateBayesianAverage(
    ratings,
    globalAverage,
    minThreshold
  )

  // Calculate Exponential Time Decay Rating
  const timeDecayRating = calculateExponentialTimeDecay(
    ratings,
    times,
    decayConstant
  )

  // Final Rating: Average of Bayesian and Time Decay Ratings
  return (bayesianRating + timeDecayRating) / 2
}

// Example Usage
// const ratings = [5, 4, 3, 5, 4] // Array of ratings (1-5 stars)
// const times = [0, 7, 30, 90, 120] // Time since each rating was given (in days)
// const globalAverage = 3.5 // Global average rating
// const minThreshold = 10 // Minimum number of reviews to stabilize Bayesian Average
// const decayConstant = 0.01 // Decay constant for Exponential Time Decay

// // Calculate ratings
// const bayesianRating = calculateBayesianAverage(
//   ratings,
//   globalAverage,
//   minThreshold
// )
// const timeDecayRating = calculateExponentialTimeDecay(
//   ratings,
//   times,
//   decayConstant
// )
// const finalRating = calculateFinalRating(
//   ratings,
//   times,
//   globalAverage,
//   minThreshold,
//   decayConstant
// )
