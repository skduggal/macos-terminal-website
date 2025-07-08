import { BsGithub, BsLinkedin } from 'react-icons/bs';
import { IoIosMail } from 'react-icons/io';
import { FaFilePdf } from 'react-icons/fa';

export default function MobileDock() {
  const handleResumeClick = () => {
    window.open('/resume.pdf', '_blank');
  };

  const handleLinkedInClick = () => {
    window.open('https://www.linkedin.com/in/sidkduggal/', '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:sidkduggal@gmail.com';
  };

  const handleGithubClick = () => {
    window.open('https://github.com/skduggal', '_blank');
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 md:hidden z-50'>
      <div className='mx-4 mb-4 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-xl rounded-3xl flex justify-around items-center max-w-[400px] mx-auto'>
        {/* Resume */}
        <button onClick={handleResumeClick} className='flex flex-col items-center cursor-pointer'>
          <div className='w-14 h-14 bg-gradient-to-t from-red-600 to-red-500 rounded-xl flex items-center justify-center'>
            <FaFilePdf size={32} className='text-white' />
          </div>
        </button>
        {/* LinkedIn */}
        <button onClick={handleLinkedInClick} className='flex flex-col items-center cursor-pointer'>
          <div className='w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center'>
            <BsLinkedin size={34} className='text-white' />
          </div>
        </button>
        {/* Email */}
        <button onClick={handleEmailClick} className='flex flex-col items-center cursor-pointer'>
          <div className='w-14 h-14 bg-gradient-to-t from-blue-600 to-blue-400 rounded-xl flex items-center justify-center'>
            <IoIosMail size={36} className='text-white' />
          </div>
        </button>
        {/* Github */}
        <button onClick={handleGithubClick} className='flex flex-col items-center cursor-pointer'>
          <div className='w-14 h-14 bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center'>
            <BsGithub size={36} className='text-gray-100' />
          </div>
        </button>
      </div>
    </div>
  );
}
