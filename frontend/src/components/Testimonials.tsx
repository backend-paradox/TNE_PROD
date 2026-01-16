import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { cineTripPackagesAPI, tourPackagesAPI, CineTripReview, TourReview } from '@/services/packageService';
import './Testimonials.css';

const avatarColors = ['orange', 'blue', 'green', 'purple', 'pink', 'teal'];

interface TestimonialWithPackage extends Partial<CineTripReview & TourReview> {
  packageName?: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialWithPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  const fetchFeaturedReviews = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching testimonials from database...');

      const allReviews: TestimonialWithPackage[] = [];

      // Fetch from CineTrip packages
      try {
        console.log('📦 Fetching CineTrip packages...');
        const cineTripPackages = await cineTripPackagesAPI.getAll();
        console.log(`✅ Found ${cineTripPackages.length} CineTrip packages`);

        const shuffledCineTrip = [...cineTripPackages].sort(() => Math.random() - 0.5);
        const selectedCineTrip = shuffledCineTrip.slice(0, 2); // Get 2 from CineTrip

        for (const pkg of selectedCineTrip) {
          try {
            const { reviews } = await cineTripPackagesAPI.getReviews(pkg.slug);
            console.log(`📝 ${pkg.name}: ${reviews.length} reviews`);

            const fiveStarReviews = reviews
              .filter(review => review.rating === 5)
              .map(review => ({
                ...review,
                packageName: pkg.name,
              }));

            if (fiveStarReviews.length > 0) {
              const randomReview = fiveStarReviews[Math.floor(Math.random() * fiveStarReviews.length)];
              allReviews.push(randomReview);
            }
          } catch (error) {
            console.error(`❌ Error fetching reviews for CineTrip ${pkg.slug}:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching CineTrip packages:', error);
      }

      // Fetch from Tour packages
      try {
        console.log('🗺️  Fetching Tour packages...');
        const tourPackages = await tourPackagesAPI.getAll();
        console.log(`✅ Found ${tourPackages.length} Tour packages`);

        const shuffledTour = [...tourPackages].sort(() => Math.random() - 0.5);
        const selectedTour = shuffledTour.slice(0, 1); // Get 1 from Tour

        for (const pkg of selectedTour) {
          try {
            const { reviews } = await tourPackagesAPI.getReviews(pkg.slug);
            console.log(`📝 ${pkg.name}: ${reviews.length} reviews`);

            const fiveStarReviews = reviews
              .filter(review => review.rating === 5)
              .map(review => ({
                ...review,
                packageName: pkg.name,
              }));

            if (fiveStarReviews.length > 0) {
              const randomReview = fiveStarReviews[Math.floor(Math.random() * fiveStarReviews.length)];
              allReviews.push(randomReview);
            }
          } catch (error) {
            console.error(`❌ Error fetching reviews for Tour ${pkg.slug}:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching Tour packages:', error);
      }

      console.log(`✅ Total testimonials fetched: ${allReviews.length}`);

      // Set testimonials (max 3)
      setTestimonials(allReviews.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('❌ Fatal error fetching testimonials:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <section className="testimonials">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <div className="testimonials-badge">
              <Star />
              <span>Customer Reviews</span>
            </div>
            <h2>What Our Travelers Say</h2>
            <p>Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="testimonials-header"
        >
          <div className="testimonials-badge">
            <Star />
            <span>Customer Reviews</span>
          </div>

          <h2>What Our Travelers Say</h2>
          <p>
            Real stories from real travelers who experienced our amazing packages
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="feature-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="testimonial-card"
            >
              {/* Quote */}
              <div className="quote-icon" aria-hidden="true">
                <Quote />
              </div>

              {/* Rating Stars */}
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="star-icon filled"
                    fill="currentColor"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="testimonial-text">"{testimonial.comment}"</p>

              {/* Package Name */}
              {testimonial.packageName && (
                <div className="trip-badge">{testimonial.packageName}</div>
              )}

              {/* Author */}
              <div className="testimonial-footer">
                <div className={`testimonial-avatar ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(testimonial.userName)}
                </div>
                <div>
                  <p className="author-name">{testimonial.userName}</p>
                  <p className="author-meta">
                    {formatDate(testimonial.createdAt)}
                    {testimonial.verified && ' • Verified'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="testimonials-stats"
        >
          {[
            { value: '50K+', label: 'Happy Travelers' },
            { value: '98%', label: 'Satisfaction Rate' }
          ].map((stat) => (
            <div key={stat.label} className="testimonial-stat">
              <p className="testimonial-stat-value">{stat.value}</p>
              <p className="testimonial-stat-label">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
