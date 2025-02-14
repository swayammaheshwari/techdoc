import React from 'react';
import { Accordion, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';
import { getFeedbacks } from '../../services/feedbackService';
import { IoIosClose } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import './publishDocsReview.scss';

const PublishDocsReview = (props) => {
  const { collectionId, orgId } = useParams();
  const router = useRouter();

  const { activeTabId, tabs, pages, pathSlug } = useSelector((state) => {
    return {
      activeTabId: state?.tabs?.activeTabId,
      tabs: state?.tabs?.tabs,
      pages: state?.pages,
    };
  });

  const redirectToRequestType = (id) => {
    if (id) {
      router.push(`/orgs/${orgId}/dashboard/${pages[id].requestType !== null ? 'endpoint' : 'page'}/${id}`);
    }
  };

  const { data: feedbacks = [], isError, error } = useQuery(['feedback', collectionId], () => getFeedbacks(collectionId), { staleTime: 600000 });

  if (isError) {
    console.error('Failed to fetch scheduled runs:', error);
  }

  const renderFeedback = () => {
    return (
      <div className='feedback-table-container'>
        <table className='table'>
          <thead>
            <tr>
              <th>Page</th>
              <th>Positive Count</th>
              <th>Negative Count</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback, index) => {
              const modalId = `feedbackModal-${index}`;
              return (
                <tr key={index}>
                  <td className='cursor-pointer pages-endpoint-feedback' onClick={() => redirectToRequestType(feedback?.pageId)}>
                    {pages[feedback?.pageId] ? pages[feedback?.pageId]?.name : 'Unknown Page'}
                  </td>
                  <td>{feedback?.positiveCount}</td>
                  <td>{feedback?.negativeCount}</td>
                  <td>
                    {Object.keys(feedback.comments)?.length === 0 ? (
                      <div>No comments</div>
                    ) : (
                      <>
                        <a href='#' variant='link' type='button' data-toggle='modal' data-target={`#${modalId}`} className='text-primary'>
                          Show Comments
                        </a>

                        <div className='modal fade feedback-model-body' id={modalId} tabIndex='-1' role='dialog' aria-labelledby={`${modalId}-label`} aria-hidden='true'>
                          <div className='modal-dialog' role='document'>
                            <div className='modal-content'>
                              <div className='modal-header px-4'>
                                <h5 className='modal-title' id={`${modalId}-label`}>
                                  Comments
                                </h5>
                                <button type='button' className='close p-0' data-dismiss='modal' aria-label='Close'>
                                  <IoIosClose />
                                </button>
                              </div>
                              <div className='modal-body p-4 mb-3'>
                                {Object.entries(feedback.comments).map(([email, comments]) => (
                                  <div key={email}>
                                    <strong>Email: {email}</strong>
                                    <br />
                                    Comments:
                                    <ol type='1'>
                                      {comments.map((comment, index) => (
                                        <li key={index} className='my-3'>
                                          {comment}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`p-4 feedback-tab overflow-y-auto w-100 h-100 ${props?.selectedTab === 9 ? '' : 'd-none'}`}>
      <h3>User Feedbacks</h3>
      <p className='text-secondary'>Check your users feedback to grow your website.</p>
      {feedbacks?.length > 0 ? (
        renderFeedback()
      ) : (
        <div className='w-50'>
          <p className='text-danger'>No feedbacks received</p>
        </div>
      )}
    </div>
  );
};

export default PublishDocsReview;
